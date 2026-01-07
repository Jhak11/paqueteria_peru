const mysql = require('mysql2/promise');

async function updatePasswords() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru',
    });

    console.log('✅ Conectado a MySQL');

    // Actualizar contraseñas a texto plano
    await connection.query(
        "UPDATE credenciales SET password_hash = 'admin123'"
    );

    console.log('✅ Todas las contraseñas actualizadas a: admin123');

    // Verificar
    const [rows] = await connection.query('SELECT correo, password_hash FROM credenciales');
    console.log('\n📋 Credenciales actuales:');
    rows.forEach(r => console.log(`  ${r.correo} / ${r.password_hash}`));

    await connection.end();
}

updatePasswords();
