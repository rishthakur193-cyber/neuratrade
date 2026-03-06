/**
 * Create lib/db.ts-specific tables that Prisma doesn't manage.
 * These are used by the raw-SQL API routes (portfolio service, advisor client, etc.)
 * and coexist alongside the Prisma-managed tables in the same schema.
 */
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
})

const SQL = `
  CREATE TABLE IF NOT EXISTS "Holding" (
    id            TEXT PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "assetType"   TEXT DEFAULT 'EQUITY',
    quantity      REAL DEFAULT 0,
    "averagePrice" REAL DEFAULT 0,
    "currentPrice" REAL DEFAULT 0,
    FOREIGN KEY("portfolioId") REFERENCES "Portfolio"(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "TransactionHistory" (
    id            TEXT PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    type          TEXT NOT NULL,
    quantity      REAL NOT NULL,
    price         REAL NOT NULL,
    date          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("portfolioId") REFERENCES "Portfolio"(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "AdvisorClient" (
    id          TEXT PRIMARY KEY,
    "advisorId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    status      TEXT DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("advisorId") REFERENCES "AdvisorProfile"(id) ON DELETE CASCADE,
    FOREIGN KEY("investorId") REFERENCES "User"(id) ON DELETE CASCADE
  );
`

pool.query(SQL)
    .then(() => {
        console.log('✅ lib/db.ts auxiliary tables created (Holding, TransactionHistory, AdvisorClient)')
        pool.end()
    })
    .catch((e) => {
        console.error('❌ Failed:', e.message)
        pool.end()
        process.exit(1)
    })
