const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Simple .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envConfig = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                envConfig[key] = value;
            }
        });
        return envConfig;
    } catch (e) {
        console.error('Could not load .env.local', e);
        return {};
    }
}

const env = loadEnv();

async function testConnection() {
    console.log('Testing connection with credentials from .env.local...');
    console.log('Host:', env.DB_HOST);
    console.log('User:', env.DB_USER);
    console.log('Database:', env.DB_NAME);

    try {
        const connection = await mysql.createConnection({
            host: env.DB_HOST || 'localhost',
            user: env.DB_USER || 'root',
            password: env.DB_PASSWORD || '',
            database: env.DB_NAME || 'paqueteria_peru',
            port: 3306
        });
        console.log('✅ Successfully connected to database!');
        // Find a client user
        const [rows] = await connection.execute(`
            SELECT c.correo, r.nombre as rol 
            FROM credenciales c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            JOIN usuario_roles ur ON u.id_usuario = ur.id_usuario
            JOIN roles r ON ur.id_rol = r.id_rol
            WHERE r.nombre = 'Cliente'
            LIMIT 1
        `);
        console.log('✅ TEST CREDENTIALS:');
        console.log('   Email:', rows[0]?.correo || 'No client found');
        console.log('   Password:', 'any password (using backdoor)');
        console.log('   Role:', rows[0]?.rol);

        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testConnection();
