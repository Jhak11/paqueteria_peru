const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    console.log('Conectado a la base de datos.');

    try {
        const sql = fs.readFileSync(path.join(__dirname, 'update_users_agency.sql'), 'utf8');
        await connection.query(sql);
        console.log('Migración completada: id_agencia_trabajo agregado.');
    } catch (error) {
        // Ignorar error si la columna ya existe (código 1060 Duplicate column name)
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('La columna ya existía. Saltando alter table.');
        } else {
            console.error('Error en migración:', error);
        }
    } finally {
        await connection.end();
    }
}

runMigration();
