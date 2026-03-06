const { Pool } = require('pg')
const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})
// Test 1: quoted table name
p.query('SELECT id, name, email, role FROM "User" WHERE email = $1 LIMIT 1', ['admin@quantelite.com'])
    .then(r => {
        console.log('✅ Quoted "User" query OK:', JSON.stringify(r.rows[0]).slice(0, 120))
        // Test 2: unquoted — will fail or return system table
        return p.query('SELECT * FROM User WHERE email = $1 LIMIT 1', ['admin@quantelite.com'])
    })
    .then(r => {
        console.log('⚠️  Unquoted User query succeeded (unexpected):', JSON.stringify(r.rows[0]).slice(0, 80))
        p.end()
    })
    .catch(e => {
        console.error('❌ Unquoted User query failed (expected):', e.message)
        p.end()
    })
