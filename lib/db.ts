import mysql from 'mysql2/promise';

// Declaración global para reutilizar el pool en desarrollo y evitar agotar conexiones
declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: mysql.Pool | undefined;
}

// Configuración del pool de conexiones hacia MySQL
const pool: mysql.Pool =
  global.mysqlPool ||
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

// En entornos que no son producción, persistimos el pool globalmente para soportar Fast Refresh
if (process.env.NODE_ENV !== 'production') {
  global.mysqlPool = pool;
}

export default pool;
