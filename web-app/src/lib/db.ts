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

export async function getDb() {
  if (usePostgres && pgPool) {
    return {
      exec: async (sql: string) => {
        // SQLite to Postgres schema conversion
        const pgSql = sql.replace(/DATETIME/g, 'TIMESTAMP').replace(/INTEGER/g, 'INT');
        await pgPool!.query(pgSql);
      },
      get: async (sql: string, params: any[] = []) => {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        const res = await pgPool!.query(pgSql, params);
        return res.rows[0];
      },
      all: async (sql: string, params: any[] = []) => {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
        const res = await pgPool!.query(pgSql, params);
        return res.rows;
      },
      run: async (sql: string, params: any[] = []) => {
        let i = 1;
        const pgSql = sql.replace(/\?/g, () => `$${i++}`);
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
      tier TEXT DEFAULT 'Registered',
      aumManaged REAL DEFAULT 0,
      alphaGenerated REAL DEFAULT 0,
      rating REAL DEFAULT 0,
      isVerified INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES User(id) ON DELETE CASCADE
    );

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
  `);

  return db;
}
