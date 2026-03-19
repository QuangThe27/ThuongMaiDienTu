const { db } = require('../../config/database');

const findAll = async () => {
    const [rows] = await db.query(
        'SELECT id, name, email, phone, address, avatar, role, status, timestamp FROM users ORDER BY timestamp DESC'
    );
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query(
        'SELECT id, name, email, phone, address, avatar, role, status, timestamp FROM users WHERE id = ? LIMIT 1',
        [id]
    );
    return rows[0];
};

const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

const create = async (data) => {
    const { name, email, password, phone, address, avatar, role, status } = data;
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, phone, address, avatar, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, password, phone, address, avatar, role || 3, status || 1]
    );
    return result.insertId;
};

const update = async (id, data) => {
    // Logic cập nhật động: chỉ update những trường có trong data
    const fields = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(', ');
    const values = Object.values(data);

    if (fields.length === 0) return true;

    const [result] = await db.query(`UPDATE users SET ${fields} WHERE id = ?`, [...values, id]);
    return result.affectedRows > 0;
};

module.exports = {
    findAll,
    findById,
    deleteById,
    create,
    update,
};
