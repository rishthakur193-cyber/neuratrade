import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Pool } from 'pg';

const usePostgres = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

let pgPool: Pool | null = null;
if (usePostgres) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

// Prisma creates PascalCase tables with double-quoted identifiers in PostgreSQL.
// Unquoted references resolve to system tables (e.g. `user` → pg_catalog.user).
// This transform wraps all known app table names in double-quotes before query execution.
const PG_TABLES = [
  'User', 'InvestorProfile', 'AdvisorProfile', 'TraineeProfile',
  'Strategy', 'Portfolio', 'Message', 'AuditLog',
  'Conversation', 'ConversationParticipant', 'CourseProgress',
  'Holding', 'TransactionHistory', 'AdvisorClient',
];
function quoteTables(sql: string): string {
  let out = sql;
  for (const tbl of PG_TABLES) {
    // Match unquoted occurrences: word boundary on both sides, not already inside quotes
    out = out.replace(new RegExp(`(?<!")\\b${tbl}\\b(?!")`, 'g'), `"${tbl}"`);
  }
  return out;
}

export async function getDb() {
  if (usePostgres && pgPool) {
    return {
      exec: async (sql: string) => {
        const pgSql = quoteTables(
          sql.replace(/DATETIME/g, 'TIMESTAMP').replace(/INTEGER/g, 'INT')
        );
        await pgPool!.query(pgSql);
      },
      get: async (sql: string, params: any[] = []) => {
        let i = 1;
        const pgSql = quoteTables(sql).replace(/\?/g, () => `$${i++}`);
        const res = await pgPool!.query(pgSql, params);
        return res.rows[0];
      },
      all: async (sql: string, params: any[] = []) => {
        let i = 1;
        const pgSql = quoteTables(sql).replace(/\?/g, () => `$${i++}`);
        const res = await pgPool!.query(pgSql, params);
        return res.rows;
      },
      run: async (sql: string, params: any[] = []) => {
        let i = 1;
        const pgSql = quoteTables(sql).replace(/\?/g, () => `$${i++}`);
        const res = await pgPool!.query(pgSql, params);
        return { changes: res.rowCount };
      }
    };
  }

  // Fallback local db
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await getDb();

  // When using PostgreSQL, Prisma manages the schema — skip DDL entirely.
  // Only run CREATE TABLE for the local SQLite fallback.
  if (usePostgres) {
    return db;
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT DEFAULT 'INVESTOR',
      kycStatus TEXT DEFAULT 'PENDING',
      twoFactorEnabled INTEGER DEFAULT 0,
      twoFactorSecret TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS AdvisorProfile (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      sebiRegNo TEXT UNIQUE NOT NULL,
      professionalVintage INTEGER DEFAULT 0,
      mandateScale TEXT,
      tier TEXT DEFAULT 'Registered',
      aumManaged REAL DEFAULT 0,
      alphaGenerated REAL DEFAULT 0,
      rating REAL DEFAULT 0,
      isVerified INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TraineeProfile (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      nismProgress REAL DEFAULT 0,
      milestonesDone INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );
  `);

  // Manual migration for existing SQLite DB
  try { await db.exec('ALTER TABLE AdvisorProfile ADD COLUMN professionalVintage INTEGER DEFAULT 0'); } catch (e) { }
  try { await db.exec('ALTER TABLE AdvisorProfile ADD COLUMN mandateScale TEXT'); } catch (e) { }
  try { await db.exec('CREATE TABLE IF NOT EXISTS TraineeProfile (id TEXT PRIMARY KEY, userId TEXT UNIQUE NOT NULL, nismProgress REAL DEFAULT 0, milestonesDone INTEGER DEFAULT 0, FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE)'); } catch (e) { }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS Portfolio (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT DEFAULT 'Main Portfolio',
      totalValue REAL DEFAULT 0,
      investedAmount REAL DEFAULT 0,
      dailyChange REAL DEFAULT 0,
      riskScore REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Holding (
      id TEXT PRIMARY KEY,
      portfolioId TEXT NOT NULL,
      assetSymbol TEXT NOT NULL,
      assetType TEXT DEFAULT 'EQUITY', 
      quantity REAL DEFAULT 0,
      averagePrice REAL DEFAULT 0,
      currentPrice REAL DEFAULT 0,
      FOREIGN KEY(portfolioId) REFERENCES Portfolio(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS TransactionHistory (
      id TEXT PRIMARY KEY,
      portfolioId TEXT NOT NULL,
      assetSymbol TEXT NOT NULL,
      type TEXT NOT NULL, -- BUY or SELL
      quantity REAL NOT NULL,
      price REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(portfolioId) REFERENCES Portfolio(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdvisorClient (
      id TEXT PRIMARY KEY,
      advisorId TEXT NOT NULL,
      investorId TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE,
      FOREIGN KEY(investorId) REFERENCES User(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS CourseProgress (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      courseId TEXT NOT NULL,
      progress REAL DEFAULT 0,
      lastAccessed DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Conversation (
      id TEXT PRIMARY KEY,
      lastMessageAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ConversationParticipant (
      conversationId TEXT NOT NULL,
      userId TEXT NOT NULL,
      PRIMARY KEY(conversationId, userId),
      FOREIGN KEY(conversationId) REFERENCES Conversation(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Message (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT DEFAULT 'SENT',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(conversationId) REFERENCES Conversation(id) ON DELETE CASCADE,
      FOREIGN KEY(senderId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AuditLog (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS InvestorRiskProfile (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      capitalRange TEXT NOT NULL,
      maxLossTolerance REAL NOT NULL,
      investmentHorizon TEXT NOT NULL,
      tradingFrequency TEXT NOT NULL,
      experienceLevel TEXT NOT NULL,
      emotionalTolerance TEXT NOT NULL,
      investorType TEXT NOT NULL,
      riskCategory TEXT NOT NULL,
      preferredStrategy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdvisorStrategyDNA (
      id TEXT PRIMARY KEY,
      advisorId TEXT UNIQUE NOT NULL,
      strategyType TEXT NOT NULL,
      avgHoldingDays REAL DEFAULT 0,
      avgRiskPerTrade REAL DEFAULT 0,
      historicalMaxDrawdown REAL DEFAULT 0,
      avgReturnPerTrade REAL DEFAULT 0,
      winRate REAL DEFAULT 0,
      consistencyScore REAL DEFAULT 0,
      capitalMin REAL DEFAULT 0,
      capitalMax REAL DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdvisorRecommendation (
      id TEXT PRIMARY KEY,
      advisorId TEXT NOT NULL,
      symbol TEXT NOT NULL,
      entryPrice REAL NOT NULL,
      stopLoss REAL NOT NULL,
      target REAL NOT NULL,
      exitPrice REAL,
      result TEXT,
      returnPct REAL,
      holdingDays INTEGER DEFAULT 0,
      tradedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      closedAt DATETIME,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdvisorTrustScore (
      id TEXT PRIMARY KEY,
      advisorId TEXT UNIQUE NOT NULL,
      consistencyScore REAL DEFAULT 0,
      riskManagementScore REAL DEFAULT 0,
      clientFeedbackScore REAL DEFAULT 0,
      transparencyScore REAL DEFAULT 0,
      overallScore REAL DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ScamFlag (
      id TEXT PRIMARY KEY,
      advisorId TEXT NOT NULL,
      flagType TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT NOT NULL,
      detectedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdvisorBrokerLink (
      id TEXT PRIMARY KEY,
      advisorId TEXT UNIQUE NOT NULL,
      brokerName TEXT NOT NULL DEFAULT 'AngelOne',
      clientCode TEXT NOT NULL,
      encryptedToken TEXT,
      feedToken TEXT,
      isActive INTEGER DEFAULT 1,
      linkedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastSyncAt DATETIME,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS VerifiedTrade (
      id TEXT PRIMARY KEY,
      advisorId TEXT NOT NULL,
      recommendationId TEXT,
      symbol TEXT NOT NULL,
      exchange TEXT NOT NULL DEFAULT 'NSE',
      brokerOrderId TEXT,
      entryPrice REAL NOT NULL,
      exitPrice REAL,
      stopLoss REAL,
      target REAL,
      qty INTEGER DEFAULT 1,
      returnPct REAL,
      holdingDays REAL DEFAULT 0,
      result TEXT,
      verificationStatus TEXT NOT NULL DEFAULT 'UNVERIFIED',
      brokerSource TEXT NOT NULL DEFAULT 'MANUAL',
      mismatchReason TEXT,
      tradedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      closedAt DATETIME,
      brokerFetchedAt DATETIME,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdvisorVerificationBadge (
      id TEXT PRIMARY KEY,
      advisorId TEXT UNIQUE NOT NULL,
      badgeLevel TEXT NOT NULL DEFAULT 'UNVERIFIED',
      verifiedTradeCount INTEGER DEFAULT 0,
      totalTradeCount INTEGER DEFAULT 0,
      verificationPct REAL DEFAULT 0,
      lastVerifiedAt DATETIME,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS MarketEvent (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      exchange TEXT NOT NULL DEFAULT 'NSE',
      eventType TEXT NOT NULL DEFAULT 'PRICE_SNAPSHOT',
      price REAL,
      change REAL,
      changePct REAL,
      volume REAL,
      vix REAL,
      sector TEXT,
      marketCondition TEXT,
      description TEXT,
      recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS MarketOpportunity (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      signalType TEXT NOT NULL,
      strength TEXT NOT NULL DEFAULT 'MODERATE',
      description TEXT NOT NULL,
      sector TEXT,
      targetPrice REAL,
      detectedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiresAt DATETIME
    );

    CREATE TABLE IF NOT EXISTS InvestorRiskAlert (
      id TEXT PRIMARY KEY,
      investorId TEXT NOT NULL,
      advisorId TEXT,
      alertType TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'MEDIUM',
      message TEXT NOT NULL,
      marketCondition TEXT,
      advisorStrategy TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(investorId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS AdvisorAdvantageScore (
      id TEXT PRIMARY KEY,
      advisorId TEXT NOT NULL,
      marketCondition TEXT NOT NULL,
      advantageScore REAL DEFAULT 0,
      reasoning TEXT,
      computedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS RecoveryProfile (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      totalLossAmt REAL DEFAULT 0,
      lossSource TEXT NOT NULL DEFAULT 'SELF',
      experienceLevel TEXT NOT NULL DEFAULT 'BEGINNER',
      confidenceLevel INTEGER DEFAULT 5,
      availableCapital REAL DEFAULT 0,
      recoveryPath TEXT NOT NULL DEFAULT 'GUIDED',
      lossLevel TEXT NOT NULL DEFAULT 'MEDIUM',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS PsychologyAssessment (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      revengeTradingScore INTEGER DEFAULT 0,
      overLeverageScore INTEGER DEFAULT 0,
      strategyHoppingScore INTEGER DEFAULT 0,
      tipFollowingScore INTEGER DEFAULT 0,
      overallRiskBehaviourScore INTEGER DEFAULT 0,
      riskLabel TEXT DEFAULT 'MODERATE',
      primaryDanger TEXT,
      lastAssessedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS RecoveryProgress (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      currentStage TEXT NOT NULL DEFAULT 'LEARN',
      stageProgress INTEGER DEFAULT 0,
      learnScore INTEGER DEFAULT 0,
      simulationPnl REAL DEFAULT 0,
      disciplineScore INTEGER DEFAULT 0,
      capitalUnlocked REAL DEFAULT 0,
      totalSimTrades INTEGER DEFAULT 0,
      profitableSimTrades INTEGER DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS SimulationTrade (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      symbol TEXT NOT NULL,
      action TEXT NOT NULL DEFAULT 'BUY',
      quantity REAL DEFAULT 1,
      entryPrice REAL DEFAULT 0,
      exitPrice REAL,
      pnl REAL,
      isCorrectCall INTEGER DEFAULT 0,
      tradeDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS RecoveryMetric (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      month TEXT NOT NULL,
      drawdownPct REAL DEFAULT 0,
      disciplineScore INTEGER DEFAULT 0,
      profitableTrades INTEGER DEFAULT 0,
      totalTrades INTEGER DEFAULT 0,
      confidenceIndex INTEGER DEFAULT 0,
      recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    -- ─────────────────────────────────────────────────────────────────────
    -- ECOSYSTEM GROWTH ENGINE TABLES (additive — no existing tables changed)
    -- ─────────────────────────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS ReputationLedgerEntry (
      id TEXT PRIMARY KEY,
      advisorId TEXT NOT NULL,
      year INTEGER NOT NULL,
      winRate REAL DEFAULT 0,
      maxDrawdown REAL DEFAULT 0,
      avgMonthlyReturn REAL DEFAULT 0,
      strategyType TEXT,
      trustScore INTEGER DEFAULT 0,
      totalTrades INTEGER DEFAULT 0,
      integrityHash TEXT,
      recordedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(advisorId) REFERENCES AdvisorProfile(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS InvestorJourney (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      stage TEXT NOT NULL DEFAULT 'BEGINNER',
      xp INTEGER DEFAULT 0,
      achievements TEXT DEFAULT '[]',
      lastActivityAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS CommunityPost (
      id TEXT PRIMARY KEY,
      authorId TEXT NOT NULL,
      authorType TEXT NOT NULL DEFAULT 'INVESTOR',
      authorName TEXT,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      likes INTEGER DEFAULT 0,
      parentId TEXT,
      isScamFlagged INTEGER DEFAULT 0,
      aiRiskScore INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ReferralCode (
      id TEXT PRIMARY KEY,
      ownerId TEXT NOT NULL,
      ownerType TEXT NOT NULL DEFAULT 'INVESTOR',
      code TEXT UNIQUE NOT NULL,
      usedBy TEXT DEFAULT '[]',
      totalReferrals INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS PortfolioInsight (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      healthScore INTEGER DEFAULT 0,
      riskExposure TEXT DEFAULT 'MEDIUM',
      diversificationScore INTEGER DEFAULT 0,
      advisorAlignment INTEGER DEFAULT 0,
      recommendations TEXT DEFAULT '[]',
      computedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS PlatformSubscription (
      id TEXT PRIMARY KEY,
      userId TEXT UNIQUE NOT NULL,
      tier TEXT NOT NULL DEFAULT 'Free',
      status TEXT DEFAULT 'ACTIVE',
      expiresAt DATETIME,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );
  `);

  return db;
}
