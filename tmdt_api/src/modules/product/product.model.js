const { db } = require('../../config/database');

// Tìm tất cả sản phẩm (chỉ lấy thông tin cơ bản)
const findAll = async () => {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY timestamp DESC');
    return rows;
};

// Tìm một sản phẩm theo ID
const findById = async (id) => {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
};

const findAllByStoreId = async (storeId) => {
    const [rows] = await db.execute(
        'SELECT * FROM products WHERE store_id = ? ORDER BY timestamp DESC',
        [storeId]
    );
    return rows;
};

const findByCategoryId = async (categoryId) => {
    const [rows] = await db.execute(
        'SELECT * FROM products WHERE category_id = ? ORDER BY timestamp DESC',
        [categoryId]
    );
    return rows;
};

// Các hàm bổ trợ để lấy dữ liệu liên quan
const findImagesByProductId = async (productId) => {
    const [rows] = await db.execute('SELECT * FROM product_images WHERE product_id = ?', [
        productId,
    ]);
    return rows;
};

const findDescriptionsByProductId = async (productId) => {
    const [rows] = await db.execute('SELECT * FROM product_descriptions WHERE product_id = ?', [
        productId,
    ]);
    return rows;
};

const findVariantsByProductId = async (productId) => {
    const [rows] = await db.execute(
        'SELECT * FROM product_variants WHERE product_id = ? ORDER BY level ASC',
        [productId]
    );
    return rows;
};

const deleteById = async (id) => {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0; // Trả về true nếu có dòng bị xóa
};

const create = async (data) => {
    const { store_id, category_id, name, status } = data;
    const [result] = await db.execute(
        'INSERT INTO products (store_id, category_id, name, status) VALUES (?, ?, ?, ?)',
        [store_id, category_id, name, status || 1]
    );
    return result.insertId;
};

const insertImages = async (productId, images) => {
    // images: [{image: 'name.jpg', isMain: 0/1}, ...]
    const values = images.map((img) => [productId, img.image, img.isMain]);
    const [result] = await db.query(
        'INSERT INTO product_images (product_id, image, isMain) VALUES ?',
        [values]
    );
    return result;
};

const insertDescriptions = async (productId, descriptions) => {
    const values = descriptions.map((desc) => [productId, desc.title, desc.content]);
    const [result] = await db.query(
        'INSERT INTO product_descriptions (product_id, title, content) VALUES ?',
        [values]
    );
    return result;
};

const insertVariants = async (productId, variants) => {
    const values = variants.map((v) => [
        productId,
        v.variant_name,
        v.variant_value,
        v.price,
        v.quantity,
        v.discount,
        v.level,
    ]);
    const [result] = await db.query(
        'INSERT INTO product_variants (product_id, variant_name, variant_value, price, quantity, discount, level) VALUES ?',
        [values]
    );
    return result;
};

const update = async (id, data) => {
    const { category_id, name, status } = data;
    const [result] = await db.execute(
        'UPDATE products SET category_id = ?, name = ?, status = ? WHERE id = ?',
        [category_id, name, status, id]
    );
    return result.affectedRows > 0;
};

const deleteImagesByProductId = async (productId) => {
    await db.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);
};

const deleteDescriptionsByProductId = async (productId) => {
    await db.execute('DELETE FROM product_descriptions WHERE product_id = ?', [productId]);
};

const deleteVariantsByProductId = async (productId) => {
    await db.execute('DELETE FROM product_variants WHERE product_id = ?', [productId]);
};

// Banner
const getBestSeller = async () => {
    const query = `
        SELECT 
            p.id, 
            p.name, 
            pi.image, 
            pd.content as description, 
            SUM(oi.quantity) as total_sold
        FROM products p
        -- JOIN với order_items để lấy số lượng
        INNER JOIN order_items oi ON p.id = oi.product_id
        -- JOIN với orders để kiểm tra trạng thái đơn hàng thành công
        INNER JOIN orders o ON oi.order_id = o.id
        -- LEFT JOIN để lấy ảnh và mô tả (tránh mất dữ liệu nếu thiếu ảnh)
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.isMain = 1
        LEFT JOIN product_descriptions pd ON p.id = pd.product_id
        WHERE p.status = 1            -- Sản phẩm còn hoạt động
          AND o.status = 3            -- Đơn hàng đã hoàn thành
          AND o.payment_status = 1    -- Đã thanh toán
        GROUP BY p.id
        ORDER BY total_sold DESC
        LIMIT 1
    `;
    const [rows] = await db.query(query);
    return rows[0];
};

module.exports = {
    findAll,
    findById,
    findAllByStoreId,
    findImagesByProductId,
    findDescriptionsByProductId,
    findVariantsByProductId,
    deleteById,
    create,
    insertImages,
    insertDescriptions,
    insertVariants,
    update,
    deleteImagesByProductId,
    deleteDescriptionsByProductId,
    deleteVariantsByProductId,
    findByCategoryId,
    getBestSeller,
};
