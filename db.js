const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Attempting to connect to DB_HOST:', process.env.DB_HOST);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 5, // Aiven free tier has low connection limits
    queueLimit: 0,
    connectTimeout: 60000, // 60s timeout
    enableKeepAlive: true,
});

async function initDB() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to Aiven MySQL database');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS koduser (
                uid INT AUTO_INCREMENT PRIMARY KEY,
                uname VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                role VARCHAR(50) DEFAULT 'customer',
                balance DECIMAL(15, 2) DEFAULT 100000.00
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS UserToken (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                token TEXT NOT NULL,
                FOREIGN KEY (username) REFERENCES koduser(uname) ON DELETE CASCADE
            )
        `);

        console.log('Tables initialized successfully');
        connection.release();
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = { pool, initDB };
