// Script para generar los hashes de contraseña para los usuarios de prueba
const bcrypt = require('bcryptjs');

async function generateHashes() {
    // Contraseñas de prueba (simples para testing)
    const passwords = {
        admin: 'admin123',
        cliente: 'cliente123',
        conductor: 'conductor123'
    };

    console.log('Generando hashes de contraseñas:\n');

    for (const [role, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`${role}:`);
        console.log(`  Contraseña: ${password}`);
        console.log(`  Hash: ${hash}`);
        console.log('');
    }
}

generateHashes().catch(console.error);
