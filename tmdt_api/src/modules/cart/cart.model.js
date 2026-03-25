const { db } = require('../../config/database');

const findAll = async () => {
    const sql = `
        SELECT c.*, p.name as product_name, pi.image, 
               pv.variant_name, pv.variant_value, pv.price, pv.discount, 
               pv.quantity as stock
        FROM carts c
        JOIN products p ON c.product_id = p.id
        JOIN product_variants pv ON c.variant_id = pv.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.isMain = 1
    `;
    const [rows] = await db.execute(sql);
    return rows;
};

const findByUserId = async (user_id) => {
    const sql = `
        SELECT c.*, p.name as product_name, pi.image, 
               pv.variant_name, pv.variant_value, pv.price, pv.discount, 
               pv.quantity as stock
        FROM carts c
        JOIN products p ON c.product_id = p.id
        JOIN product_variants pv ON c.variant_id = pv.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.isMain = 1
        WHERE c.user_id = ?
    `;
    const [rows] = await db.execute(sql, [user_id]);
    return rows;
};

const findVariantById = async (variant_id) => {
    const [rows] = await db.execute('SELECT * FROM product_variants WHERE id = ?', [variant_id]);
    return rows[0];
};

const findCartItem = async (user_id, variant_id) => {
    const [rows] = await db.execute('SELECT * FROM carts WHERE user_id = ? AND variant_id = ?', [user_id, variant_id]);
    return rows[0];
};

const create = async (data) => {
    const { user_id, product_id, variant_id, quantity } = data;
    const sql = 'INSERT INTO carts (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)';
    const [result] = await db.execute(sql, [user_id, product_id, variant_id, quantity]);
    return result.insertId;
};

const updateQuantity = async (id, quantity) => {
    await db.execute('UPDATE carts SET quantity = ? WHERE id = ?', [quantity, id]);
};

const deleteById = async (id) => {
    const [result] = await db.execute('DELETE FROM carts WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = { 
    findAll, 
    findByUserId, 
    findVariantById, 
    findCartItem, 
    create, 
    updateQuantity, 
    deleteById 
};