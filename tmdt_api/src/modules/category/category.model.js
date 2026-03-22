const { db } = require('../../config/database');

const findAll = async () => {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
};

const findByName = async (name) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE name = ?', [name]);
    return rows[0];
};

const create = async (data) => {
    const { name, status } = data;
    const [result] = await db.query(
        'INSERT INTO categories (name, status) VALUES (?, ?)',
        [name, status || 0]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    if (fields.length === 0) return false;

    const [result] = await db.query(`UPDATE categories SET ${fields} WHERE id = ?`, [...values, id]);
    return result.affectedRows > 0;
};

const deleteById = async (id) => {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = { findAll, findById, findByName, create, update, deleteById };