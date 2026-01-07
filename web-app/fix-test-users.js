
const mysql = require('mysql2/promise');

async function fixUsers() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        console.log('Conectado a la BD.');

        // 1. Verificar si existen
        const [existing] = await connection.query("SELECT correo FROM credenciales WHERE correo IN ('counter@paqueteria.pe', 'conductor@paqueteria.pe')");
        const existingEmails = existing.map(u => u.correo);
        console.log('Usuarios existentes:', existingEmails);

        // Ubigeo base
        await connection.query("INSERT IGNORE INTO ubigeo (id_ubigeo, departamento, provincia, distrito) VALUES ('150101', 'LIMA', 'LIMA', 'LIMA')");

        // Counter
        if (!existingEmails.includes('counter@paqueteria.pe')) {
            console.log('Creando usuario Counter...');
            const [uRes] = await connection.query("INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo) VALUES ('Carlos', 'Counter', 'DNI', '99887766', '999888777', 'Av. Counter 123', '150101')");
            const uid = uRes.insertId;
            await connection.query("INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (?, 'counter@paqueteria.pe', 'admin123', 'activo')", [uid]);
            await connection.query("INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, 3)", [uid]); // 3 = Empleado
        }

        // Conductor
        if (!existingEmails.includes('conductor@paqueteria.pe')) {
            console.log('Creando usuario Conductor...');
            const [uRes] = await connection.query("INSERT INTO usuarios (nombres, apellidos, tipo_documento, numero_documento, telefono, direccion, id_ubigeo) VALUES ('Pedro', 'Conductor', 'DNI', '55443322', '999555444', 'Av. Ruta 456', '150101')");
            const uid = uRes.insertId;
            await connection.query("INSERT INTO credenciales (id_usuario, correo, password_hash, estado) VALUES (?, 'conductor@paqueteria.pe', 'admin123', 'activo')", [uid]);
            await connection.query("INSERT INTO usuario_roles (id_usuario, id_rol) VALUES (?, 4)", [uid]); // 4 = Conductor
        }

        // Forzar update por seguridad
        await connection.query("UPDATE credenciales SET password_hash = 'admin123' WHERE correo IN ('counter@paqueteria.pe', 'conductor@paqueteria.pe', 'admin@paqueteria.pe', 'juan.perez@email.com')");

        console.log('✅ Usuarios creados/actualizados exitosamente.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

fixUsers();
