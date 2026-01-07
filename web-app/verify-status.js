
const mysql = require('mysql2/promise');

async function verifyStatus() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        console.log('--- ESTADO DE BASE DE DATOS ---');

        // Contar Ubigeos
        const [ubigeoCount] = await connection.query("SELECT COUNT(*) as total FROM ubigeo");
        console.log(`Ubigeos encontrados: ${ubigeoCount[0].total}`);

        // Ver usuarios de prueba
        const [users] = await connection.query("SELECT correo FROM credenciales WHERE correo IN ('counter@paqueteria.pe', 'conductor@paqueteria.pe', 'admin@paqueteria.pe')");
        console.log('Usuarios de prueba encontrados:', users.map(u => u.correo));

        // Ver si existe columna id_conductor en viajes
        const [cols] = await connection.query("SHOW COLUMNS FROM viajes LIKE 'id_conductor'");
        console.log('Columna id_conductor en viajes:', cols.length > 0 ? 'SI' : 'NO');

    } catch (error) {
        console.error('Error verificando:', error.message);
    } finally {
        await connection.end();
    }
}

verifyStatus();
