
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkDb() {
    console.log('--- DB Check ---');
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', tables.map(t => t.name).join(', '));

        const users = await db.all("SELECT id, name, email, role FROM User");
        console.log('Users Count:', users.length);
        if (users.length > 0) {
            console.log('Latest User:', users[users.length - 1]);
        }
    } catch (error) {
        console.error('DB Check FAILED:', error);
    }
    console.log('----------------');
}

checkDb();
