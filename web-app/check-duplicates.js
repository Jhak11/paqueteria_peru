
const mysql = require('mysql2/promise');

async function checkDuplicates() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        console.log('--- USUARIOS REGISTRADOS ---');
        console.log('(DNI / Nombres / Apellidos)');
        const [users] = await connection.query("SELECT numero_documento, nombres, apellidos FROM usuarios");
        console.table(users);

        console.log('\n--- CREDENCIALES (EMAILS) ---');
        const [creds] = await connection.query("SELECT correo, estado FROM credenciales");
        console.table(creds);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkDuplicates();
