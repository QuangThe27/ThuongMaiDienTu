const { db } = require('../../config/database');

const findAll = async () => {
    const [rows] = await db.query(`
        SELECT 
            s.id, 
            s.store_name, 
            s.logo, 
            s.image_sub, 
            s.status, 
            s.created_at, 
            u.name as owner_name 
        FROM stores s 
        JOIN users u ON s.user_id = u.id
    `);
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM stores WHERE id = ?', [id]);
    return rows[0];
};

const findByUserId = async (userId) => {
    const [rows] = await db.query('SELECT * FROM stores WHERE user_id = ?', [userId]);
    return rows[0];
};

const create = async (data) => {
    const { user_id, store_name, logo, image_sub, description, status } = data;
    const [result] = await db.query(
        'INSERT INTO stores (user_id, store_name, logo, image_sub, description, status) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, store_name, logo, image_sub, description, status || 1]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const fields = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(', ');
    const values = Object.values(data);
    if (fields.length === 0) return false;

    const [result] = await db.query(`UPDATE stores SET ${fields} WHERE id = ?`, [...values, id]);
    return result.affectedRows > 0;
};

const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM stores WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = { findAll, findById, findByUserId, create, update, deleteById };
