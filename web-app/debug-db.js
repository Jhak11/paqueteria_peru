
const mysql = require('mysql2/promise');

async function checkData() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        console.log('--- Verificando Roles ---');
        const [roles] = await connection.query("SELECT * FROM roles");
        console.table(roles);

        console.log('\n--- Verificando Ubigeo 150101 ---');
        const [ubigeo] = await connection.query("SELECT * FROM ubigeo WHERE id_ubigeo = '150101'");
        console.table(ubigeo);

        if (ubigeo.length === 0) {
            console.log('❌ FALTA EL UBIGEO 150101. Intentando crearlo...');
            await connection.query("INSERT INTO ubigeo (id_ubigeo, departamento, provincia, distrito) VALUES ('150101', 'LIMA', 'LIMA', 'LIMA')");
            console.log('✅ Ubigeo 150101 creado.');
        }

        if (!roles.find(r => r.id_rol === 2)) {
            console.log('❌ FALTA EL ROL ID 2 (Cliente). Intentando crearlo...');
            // Asumiendo IDs: 1 Admin, 2 Cliente, 3 Empleado, 4 Conductor
            await connection.query(`INSERT IGNORE INTO roles (id_rol, nombre, descripcion) VALUES 
                (1, 'Administrador', 'Acceso total'),
                (2, 'Cliente', 'Acceso a portal clientes'),
                (3, 'Empleado', 'Personal interno/Counter'),
                (4, 'Conductor', 'Choferes')
             `);
            console.log('✅ Roles creados/reparados.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkData();
