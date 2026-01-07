const bcrypt = require('bcryptjs');

async function testPassword() {
    const hash = '$2b$10$lO43FFrrwtlMn9a6UJtmdeFHvy5M1bGAquLE.3acScaDmmi1wTky';

    // Probando diferentes contraseñas
    const passwords = ['admin123', 'cliente123', 'wrongpassword'];

    console.log('🔐 Testeando validación de contraseñas:\n');

    for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, hash);
        console.log(`Contraseña "${pwd}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
    }
}

testPassword();
