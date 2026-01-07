const mysql = require('mysql2/promise');
const fs = require('fs');

async function fixCounterAgency() {
    console.log('--- ASIGNANDO AGENCIA A USUARIO COUNTER ---');

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        // Verificar estado actual
        console.log('\n1. Verificando estado actual del usuario Counter...');
        const [before] = await connection.query(`
            SELECT 
                u.id_usuario, 
                u.nombres, 
                u.apellidos, 
                u.id_agencia_trabajo, 
                a.nombre as agencia,
                c.correo
            FROM usuarios u
            LEFT JOIN agencias a ON u.id_agencia_trabajo = a.id_agencia
            JOIN credenciales c ON u.id_usuario = c.id_usuario
            WHERE c.correo = 'counter@paqueteria.pe'
        `);

        if (before.length === 0) {
            console.log('❌ Usuario Counter no encontrado');
            return;
        }

        console.log('Estado actual:', before[0]);

        // Actualizar agencia
        console.log('\n2. Asignando Agencia 1 (Sede Central)...');
        const [result] = await connection.query(`
            UPDATE usuarios u
            JOIN credenciales c ON u.id_usuario = c.id_usuario
            SET u.id_agencia_trabajo = 1
            WHERE c.correo = 'counter@paqueteria.pe'
        `);

        console.log(`✅ Actualizado: ${result.affectedRows} fila(s)`);

        // Verificar después
        console.log('\n3. Verificando después de la actualización...');
        const [after] = await connection.query(`
            SELECT 
                u.id_usuario, 
                u.nombres, 
                u.apellidos, 
                u.id_agencia_trabajo, 
                a.nombre as agencia
            FROM usuarios u
            LEFT JOIN agencias a ON u.id_agencia_trabajo = a.id_agencia
            JOIN credenciales c ON u.id_usuario = c.id_usuario
            WHERE c.correo = 'counter@paqueteria.pe'
        `);

        console.log('Estado final:', after[0]);

        if (after[0].id_agencia_trabajo) {
            console.log(`\n✅ ¡Éxito! Usuario Counter ahora trabaja en: ${after[0].agencia}`);
        } else {
            console.log('\n❌ Error: Agencia no asignada');
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await connection.end();
    }
}

fixCounterAgency();
