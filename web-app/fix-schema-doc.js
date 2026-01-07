
const mysql = require('mysql2/promise');

async function applyFix() {
    console.log('Conectando a BD...');
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '', // Assuming empty or try typical defaults if failed, but user env might have it. 
        // Better: use the same config as db.js if visible
        database: 'paqueteria_peru'
    });

    try {
        console.log('Aplicando corrección a direccion_destino_envio...');
        await connection.query(`
            ALTER TABLE direccion_destino_envio 
            ADD COLUMN numero_documento VARCHAR(20) AFTER nombre_destinatario;
        `);
        console.log('✅ Columna numero_documento agregada correctamente.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ La columna ya existe.');
        } else {
            console.error('❌ Error:', error);
        }
    } finally {
        await connection.end();
    }
}

applyFix();
