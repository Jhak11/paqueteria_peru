// Script para ejecutar archivos SQL desde Node.js
import { createConnection } from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function executeSQLFile(connection, filePath, fileName) {
    console.log(`\n📄 Ejecutando: ${fileName}...`);

    try {
        const sql = await readFile(filePath, 'utf8');

        // Dividir el archivo en statements individuales
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'USE paqueteria_peru');

        let successCount = 0;

        for (const statement of statements) {
            if (statement.length < 10) continue;

            try {
                await connection.query(statement);
                successCount++;
            } catch (error) {
                // Ignorar errores de duplicados
                if (!error.message.includes('Duplicate')) {
                    console.log(`   ⚠️ ${error.message.substring(0, 80)}`);
                }
            }
        }

        console.log(`   ✅ Completado: ${successCount} operaciones ejecutadas`);
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
        // Conectar a la base de datos (ajusta la contraseña si es necesario)
        connection = await createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Cambia aquí si tienes contraseña
            database: 'paqueteria_peru'
        });

        console.log('✅ Conexión a MySQL exitosa\n');

        const baseDir = join(__dirname, '..', 'paqueteria_peru_bd');

        // Ejecutar archivos en orden
        await executeSQLFile(connection, join(baseDir, 'rutas.sql'), 'rutas.sql');
        await executeSQLFile(connection, join(baseDir, 'tarifas.sql'), 'tarifas.sql');
        await executeSQLFile(connection, join(baseDir, 'viajes.sql'), 'viajes.sql');

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
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

main();
