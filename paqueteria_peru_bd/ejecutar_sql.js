// Script para ejecutar archivos SQL desde Node.js
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function executeSQLFile(connection, filePath) {
    console.log(`\n📄 Ejecutando: ${path.basename(filePath)}...`);

    try {
        const sql = await fs.readFile(filePath, 'utf8');

        // Dividir el archivo en statements individuales
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        let successCount = 0;

        for (const statement of statements) {
            try {
                await connection.query(statement);
                successCount++;
            } catch (error) {
                // Ignorar errores de "already exists" en INSERT IGNORE
                if (!error.message.includes('Duplicate entry')) {
                    console.error(`   ⚠️ Error en statement: ${error.message}`);
                }
            }
        }

        console.log(`   ✅ Completado: ${successCount} statements ejecutados`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error leyendo archivo: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Iniciando carga de datos de Rutas, Viajes y Tarifas...\n');

    let connection;

    try {
        // Conectar a la base de datos
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Si tienes contraseña, cámbiala aquí
            database: 'paqueteria_peru',
            multipleStatements: true
        });

        console.log('✅ Conexión a MySQL exitosa\n');

        const baseDir = 'c:/Users/ASUS 40-60/Downloads/paqueteria_peru_Software/paqueteria_peru_bd';

        // Ejecutar archivos en orden
        const files = [
            path.join(baseDir, 'rutas.sql'),
            path.join(baseDir, 'tarifas.sql'),
            path.join(baseDir, 'viajes.sql')
        ];

        for (const file of files) {
            await executeSQLFile(connection, file);
        }

        // Verificar resultados
        console.log('\n📊 Verificando datos insertados...\n');

        const [rutas] = await connection.query('SELECT COUNT(*) as total FROM rutas');
        console.log(`   🗺️  Rutas: ${rutas[0].total}`);

        const [tarifas] = await connection.query('SELECT COUNT(*) as total FROM tarifas');
        console.log(`   💰 Tarifas: ${tarifas[0].total}`);

        const [viajes] = await connection.query('SELECT COUNT(*) as total FROM viajes');
        console.log(`   🚚 Viajes: ${viajes[0].total}`);

        console.log('\n✅ ¡Carga de datos completada exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
