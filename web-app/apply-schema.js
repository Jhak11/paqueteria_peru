const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// --- Load Env ---
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
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
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

// --- SQL Parser ---
function parseSqlFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const queries = [];
    let currentQuery = '';
    let delimiter = ';';

    for (let line of lines) {
        let trimmedLine = line.trim();

        // Skip comments
        if (trimmedLine.startsWith('--') || trimmedLine.startsWith('/*')) continue;
        if (!trimmedLine) continue;

        // Handle DELIMITER command
        if (trimmedLine.toUpperCase().startsWith('DELIMITER ')) {
            delimiter = trimmedLine.split(' ')[1].trim();
            continue;
        }

        currentQuery += line + '\n';

        if (trimmedLine.endsWith(delimiter)) {
            let statment = currentQuery.trim();
            statment = statment.substring(0, statment.length - delimiter.length).trim();

            if (statment) {
                queries.push(statment);
            }
            currentQuery = '';
        }
    }
    return queries;
}

// --- Main Execution ---
async function run() {
    console.log('Starting Schema Migration...');

    // Connect with local infile flag
    const connection = await mysql.createConnection({
        host: env.DB_HOST || 'localhost',
        user: env.DB_USER || 'root',
        password: env.DB_PASSWORD || '',
        multipleStatements: true,
        flags: ['+LOCAL_FILES'], // Enable LOCAL INFILE on client
        infileStreamFactory: (path) => fs.createReadStream(path) // Provide stream
    });

    console.log('Connected to MySQL.');

    const files = [
        '../paqueteria_peru_bd/creacion.sql',
        '../paqueteria_peru_bd/vistas_seguridad.sql',
        '../paqueteria_peru_bd/operaciones.sql',
        '../paqueteria_peru_bd/carga_de_datos.sql'
    ];

    for (const fileRelPath of files) {
        const fullPath = path.resolve(__dirname, fileRelPath);
        console.log(`Processing ${fileRelPath}...`);

        try {
            const queries = parseSqlFile(fullPath);
            for (const query of queries) {
                try {
                    await connection.query(query);
                } catch (qErr) {
                    // Filter "Table exists" or "Drop" errors to reduce noise, 
                    // but show logic errors.
                    // Special case: LOAD DATA might fail if file not found or perm, 
                    // but we added manual inserts so we can ignore and continue.
                    console.warn(`Query Error in ${fileRelPath}: ${qErr.message}`);
                    // console.warn('Skipping...');
                }
            }
            console.log(`✅ Processed ${fileRelPath}`);
        } catch (err) {
            console.error(`Failed to read/parse ${fileRelPath}:`, err.message);
        }
    }

    console.log('Migration Complete.');
    await connection.end();
}

run().catch(console.error);
