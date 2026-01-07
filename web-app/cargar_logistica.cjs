const mysql = require('mysql2/promise');
const fs = require('fs/promises');
const path = require('path');

async function executeSQLFile(connection, filePath, fileName) {
    console.log(`\n📄 Ejecutando: ${fileName}...`);

    try {
        const sql = await fs.readFile(filePath, 'utf8');

        // Ejecutar todo el contenido del archivo
        await connection.query(sql);

        console.log(`   ✅ Completado exitosamente`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
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
            password: '', // IMPORTANTE: Cambia aquí si tienes contraseña
            database: 'paqueteria_peru',
            multipleStatements: true
        });

        console.log('✅ Conexión a MySQL exitosa');

        const baseDir = path.join(__dirname, '..', 'paqueteria_peru_bd');

        // Ejecutar archivos en orden
        await executeSQLFile(connection, path.join(baseDir, 'rutas.sql'), 'rutas.sql');
        await executeSQLFile(connection, path.join(baseDir, 'tarifas.sql'), 'tarifas.sql');
        await executeSQLFile(connection, path.join(baseDir, 'viajes.sql'), 'viajes.sql');

        // Verificar resultados
        console.log('\n📊 Verificando datos insertados...');

        const [rutas] = await connection.query('SELECT COUNT(*) as total FROM rutas');
        console.log(`\n   🗺️  Rutas: ${rutas[0].total}`);

        const [tarifas] = await connection.query('SELECT COUNT(*) as total FROM tarifas');
        console.log(`   💰 Tarifas: ${tarifas[0].total}`);

        const [viajes] = await connection.query('SELECT COUNT(*) as total FROM viajes');
        console.log(`   🚚 Viajes: ${viajes[0].total}`);

        console.log('\n✅ ¡Carga de datos completada exitosamente!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
