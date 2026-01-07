const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './.env.local' });

async function runMigration() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        });

        console.log('Connected to database.');

        const sqlPath = path.join(__dirname, '../paqueteria_peru_bd/tarifas.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing tarifas.sql...');
        await connection.query(sql);
        console.log('Migration completed successfully.');

        await connection.end();
    } catch (error) {
        console.error('Error running migration:', error);
    }
}

runMigration();
