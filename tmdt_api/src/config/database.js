const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function connectDB() {
    try {
        const connection = await db.getConnection();
        console.log('Kết nối MySQL thành công');
        connection.release();
    } catch (error) {
        console.error('Kết nối MySQL thất bại:', error.message);
        process.exit(1);
    }
}

module.exports = { db, connectDB };
