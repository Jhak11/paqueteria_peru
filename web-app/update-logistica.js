
const mysql = require('mysql2/promise');
const fs = require('fs');
const readline = require('readline');

async function updateLogistics() {
    console.log('--- INICIANDO ACTUALIZACIÓN LOGÍSTICA ---');

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'jhakesnayder123',
        database: 'paqueteria_peru'
    });

    try {
        // 1. ALTER TABLE viajes
        console.log('\n1. Modificando tabla viajes...');
        try {
            // Verificar si ya existe la columna
            const [cols] = await connection.query("SHOW COLUMNS FROM viajes LIKE 'id_conductor'");
            if (cols.length === 0) {
                await connection.query(`
                    ALTER TABLE viajes
                    ADD COLUMN id_conductor INT NOT NULL AFTER id_vehiculo,
                    ADD CONSTRAINT fk_viaje_conductor FOREIGN KEY (id_conductor) REFERENCES usuarios(id_usuario)
                `);
                console.log('✅ Tabla viajes modificada (columna agregada).');
            } else {
                console.log('ℹ️ La columna id_conductor ya existe.');
            }
        } catch (e) {
            console.error('❌ Error alterando viajes:', e.message);
        }

        // 2. LOAD UBIGEO
        console.log('\n2. Cargando Ubigeo...');
        const csvPath = 'C:/Users/ASUS 40-60/Downloads/paqueteria_peru_bd (1)/paqueteria_peru_bd/ubigeo.csv';
        let ubigeoLoaded = false;

        if (fs.existsSync(csvPath)) {
            console.log(`Leyendo CSV desde: ${csvPath}`);
            const stream = fs.createReadStream(csvPath);
            const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

            let count = 0;
            let batch = [];
            const BATCH_SIZE = 1000;
            let isFirstLine = true;

            for await (const line of rl) {
                if (isFirstLine) { isFirstLine = false; continue; }
                if (!line.trim()) continue;

                const parts = line.split(';');
                if (parts.length >= 4) {
                    const id = parts[0].replace(/"/g, '').trim();
                    const dep = parts[1].replace(/"/g, '').trim();
                    const prov = parts[2].replace(/"/g, '').trim();
                    const dist = parts[3].replace(/"/g, '').trim();

                    batch.push([id, dep, prov, dist]);

                    if (batch.length >= BATCH_SIZE) {
                        await connection.query('INSERT IGNORE INTO ubigeo (id_ubigeo, departamento, provincia, distrito) VALUES ?', [batch]);
                        count += batch.length;
                        batch = [];
                    }
                }
            }
            if (batch.length > 0) {
                await connection.query('INSERT IGNORE INTO ubigeo (id_ubigeo, departamento, provincia, distrito) VALUES ?', [batch]);
                count += batch.length;
            }
            console.log(`✅ Carga masiva de Ubigeo completada: ${count} registros.`);
            ubigeoLoaded = true;
        } else {
            console.warn(`⚠️ NO SE ENCONTRÓ EL CSV en: ${csvPath}`);
            console.warn('Se insertarán solo los ubigeos requeridos para las agencias.');
        }

        // Ubigeos esenciales para las agencias (backup si falla el CSV)
        const essentialUbigeos = [
            ['150101', 'LIMA', 'LIMA', 'LIMA'],
            ['040101', 'AREQUIPA', 'AREQUIPA', 'AREQUIPA'],
            ['080101', 'CUSCO', 'CUSCO', 'CUSCO'],
            ['130101', 'LA LIBERTAD', 'TRUJILLO', 'TRUJILLO'],
            ['140101', 'LAMBAYEQUE', 'CHICLAYO', 'CHICLAYO'],
            ['200101', 'PIURA', 'PIURA', 'PIURA'],
            ['120101', 'JUNIN', 'HUANCAYO', 'HUANCAYO'],
            ['160101', 'LORETO', 'MAYNAS', 'IQUITOS']
        ];
        // Insertar esenciales siempre por seguridad (INSERT IGNORE)
        await connection.query('INSERT IGNORE INTO ubigeo (id_ubigeo, departamento, provincia, distrito) VALUES ?', [essentialUbigeos]);


        // 3. INSERT AGENCIAS
        console.log('\n3. Insertando Agencias...');
        // Verificar duplicados por nombre antes de insertar para no llenar de basura si se corre varias veces
        const agenciasData = [
            ['Sede Central Lima', 'Av. Javier Prado Este 2501', '150101', 'mixta', '01-224-5555', 'activa'],
            ['Base Arequipa', 'Calle Mercaderes 500', '040101', 'mixta', '054-222-111', 'activa'],
            ['Base Cusco', 'Av. El Sol 800', '080101', 'mixta', '084-233-444', 'activa'],
            ['Agencia Trujillo', 'Jr. Pizarro 400', '130101', 'mixta', '044-211-122', 'activa'],
            ['Agencia Chiclayo', 'Av. Balta 1200', '140101', 'destino', '074-200-300', 'activa'],
            ['Agencia Piura', 'Calle Tacna 550', '200101', 'destino', '073-300-400', 'activa'],
            ['Agencia Huancayo', 'Calle Real 900', '120101', 'origen', '064-500-600', 'activa'],
            ['Agencia Iquitos', 'Av. Quiñones 120', '160101', 'destino', '065-222-222', 'activa']
        ];

        let insertedAgencias = 0;
        for (const agencia of agenciasData) {
            // Check existence
            const [existing] = await connection.query('SELECT id_agencia FROM agencias WHERE nombre = ?', [agencia[0]]);
            if (existing.length === 0) {
                await connection.query(
                    'INSERT INTO agencias (nombre, direccion, id_ubigeo, tipo, telefono, estado) VALUES (?, ?, ?, ?, ?, ?)',
                    agencia
                );
                insertedAgencias++;
            }
        }
        console.log(`✅ Agencias insertadas: ${insertedAgencias} (omitidas: ${agenciasData.length - insertedAgencias})`);

        console.log('\n--- PROCESO FINALIZADO ---');

    } catch (e) {
        console.error('ERROR CRÍTICO:', e);
    } finally {
        await connection.end();
    }
}

updateLogistics();
