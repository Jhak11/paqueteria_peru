
const mysql = require('mysql2/promise');

async function repairDB() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        console.log('--- REPARANDO BASE DE DATOS ---');

        // 1. Asegurar Ubigeo Lima
        await connection.query("INSERT IGNORE INTO ubigeo (id_ubigeo, departamento, provincia, distrito) VALUES ('150101', 'LIMA', 'LIMA', 'LIMA')");
        console.log('✅ Ubigeo 150101 asegurado.');

        // 2. Asegurar Roles
        console.log('Insertando roles...');
        await connection.query(`INSERT IGNORE INTO roles (id_rol, nombre, descripcion) VALUES 
            (1, 'Administrador', 'Acceso total'),
            (2, 'Cliente', 'Acceso a portal clientes'),
            (3, 'Empleado', 'Personal interno/Counter'),
            (4, 'Conductor', 'Choferes')
        `);
        console.log('✅ Roles asegurados.');

        // 3. Verificar ids
        const [roles] = await connection.query("SELECT * FROM roles");
        console.log('Roles actuales:', roles.map(r => `${r.id_rol}:${r.nombre}`));

    } catch (error) {
        console.error('Error reparando DB:', error);
    } finally {
        await connection.end();
    }
}

repairDB();
