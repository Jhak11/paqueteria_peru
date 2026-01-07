import mysql from 'mysql2/promise';
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};
let pool;
if (process.env.NODE_ENV === 'production') {
    pool = mysql.createPool(dbConfig);
}
else {
    if (!global.mysqlPool) {
        global.mysqlPool = mysql.createPool(dbConfig);
    }
    pool = global.mysqlPool;
}
export default pool;
