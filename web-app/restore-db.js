
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function restoreDatabase() {
    console.log('--- INICIANDO RESTAURACIÓN DE BASE DE DATOS ---');

    // Conexión inicial sin seleccionar DB para poder crearla
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'jhakesnayder123',
        multipleStatements: true // Importante para correr scripts SQL completos
    });

    try {
        // 1. Leer y ejecutar creacion.sql
        console.log('\n1. Ejecutando creacion.sql...');
        const createSqlPath = path.join(__dirname, '../paqueteria_peru_bd/creacion.sql');
        if (fs.existsSync(createSqlPath)) {
            const createSql = fs.readFileSync(createSqlPath, 'utf8');
            await connection.query(createSql);
            console.log('✅ Esquema creado.');
        } else {
            console.error('❌ NO SE ENCONTRÓ creacion.sql');
            return;
        }

        // 2. Leer y ejecutar carga_de_datos.sql
        console.log('\n2. Ejecutando carga_de_datos.sql...');
        const dataSqlPath = path.join(__dirname, '../paqueteria_peru_bd/carga_de_datos.sql');
        if (fs.existsSync(dataSqlPath)) {
            const dataSql = fs.readFileSync(dataSqlPath, 'utf8');
            // Necesitamos usar la DB creada
            await connection.query('USE paqueteria_peru');
            await connection.query(dataSql);
            console.log('✅ Datos iniciales cargados.');
        } else {
            console.log('⚠️ No se encontró carga_de_datos.sql, saltando carga inicial.');
        }

        console.log('\n--- Ejecutando parches y scripts adicionales ---');

    } catch (error) {
        console.error('❌ Error fatal en SQL:', error);
        return;
    } finally {
        await connection.end();
    }

    // 3. Ejecutar scripts de Node existentes (update-logistica.js, fix-test-users.js)
    // Usamos require/child_process o simplemente importamos si fueran módulos, 
    // pero como son scripts standalone, los ejecutaremos con child_process para asegurar aislamiento

    const { execSync } = require('child_process');

    try {
        console.log('\n3. Ejecutando update-logistica.js...');
        execSync('node update-logistica.js', { stdio: 'inherit', cwd: __dirname });
        console.log('✅ Logística actualizada.');

        console.log('\n4. Ejecutando fix-test-users.js...');
        execSync('node fix-test-users.js', { stdio: 'inherit', cwd: __dirname });
        console.log('✅ Usuarios de prueba restaurados.');

    } catch (error) {
        console.error('❌ Error ejecutando scripts adicionales:', error.message);
    }

    console.log('\n✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE.');
}

restoreDatabase();
