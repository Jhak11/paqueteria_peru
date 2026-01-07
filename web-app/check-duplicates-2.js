
const mysql = require('mysql2/promise');

async function checkDuplicates() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        const [users] = await connection.query("SELECT numero_documento, nombres FROM usuarios");
        console.log('USUARIOS:', JSON.stringify(users));

        const [creds] = await connection.query("SELECT correo FROM credenciales");
        console.log('CREDENCIALES:', JSON.stringify(creds));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkDuplicates();
