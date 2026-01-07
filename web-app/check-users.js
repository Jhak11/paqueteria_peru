const mysql = require('mysql2/promise');

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'jhakesnayder123',
            database: 'paqueteria_peru',
        });

        console.log('✅ Conectado a MySQL\n');

        // Verificar usuarios y credenciales
        const [users] = await connection.query(`
            SELECT 
                u.id_usuario,
                u.nombres,
                u.apellidos,
                c.correo,
                c.password_hash,
                c.estado,
                r.nombre as rol
            FROM usuarios u
            JOIN credenciales c ON u.id_usuario = c.id_usuario
            LEFT JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN roles r ON ur.id_rol = r.id_rol
            ORDER BY u.id_usuario
        `);

        console.log('📋 USUARIOS EN LA BASE DE DATOS:\n');
        users.forEach(user => {
            console.log(`ID: ${user.id_usuario}`);
            console.log(`Nombre: ${user.nombres} ${user.apellidos}`);
            console.log(`Email: ${user.correo}`);
            console.log(`Rol: ${user.rol || 'Sin rol'}`);
            console.log(`Estado: ${user.estado}`);
            console.log(`Hash: ${user.password_hash.substring(0, 30)}...`);
            console.log('---\n');
        });

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkUsers();
