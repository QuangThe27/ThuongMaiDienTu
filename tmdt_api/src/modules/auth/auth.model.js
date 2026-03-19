const { db } = require('../../config/database');

const findByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0];
};

const findByPhone = async (phone) => {
    const [rows] = await db.query('SELECT id FROM users WHERE phone = ? LIMIT 1', [phone]);
    return rows[0];
};

const createUser = async (data) => {
    const { name, email, password, phone, address } = data;

    // role 3: customer, status 1: active (theo thiết kế TINYINT)
    const [result] = await db.query(
        `INSERT INTO users 
        (name, email, password, phone, address, role, status) 
        VALUES (?, ?, ?, ?, ?, 3, 1)`,
        [name, email, password, phone, address]
    );

    return result.insertId;
};

const updatePassword = async (id, password) => {
    await db.query('UPDATE users SET password = ? WHERE id = ?', [password, id]);
};

module.exports = {
    findByEmail,
    findByPhone,
    createUser,
    updatePassword,
};
