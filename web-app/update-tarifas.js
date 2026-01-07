require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
    const config = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    };

    console.log('🔗 Conectando a la BD...', config.database);
    const connection = await mysql.createConnection(config);

    try {
        const sqlPath = path.join(__dirname, '../paqueteria_peru_bd/tarifas.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📂 Ejecutando tarifas.sql...');
        await connection.query(sql);

        console.log('✅ Tabla tarifas creada y datos cargados exitosamente.');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

run();
