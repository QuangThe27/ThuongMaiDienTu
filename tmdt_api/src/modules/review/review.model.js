const { db } = require('../../config/database');

const create = async (reviewData, images, orderItem_id) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Chèn dữ liệu vào bảng reviews (Dùng created_at theo Schema của bạn)
        const [reviewResult] = await connection.execute(
            `INSERT INTO reviews (user_id, product_id, orderItem_id, content, point) 
             VALUES (?, ?, ?, ?, ?)`,
            [reviewData.user_id, reviewData.product_id, orderItem_id, reviewData.content, reviewData.point]
        );

        const reviewId = reviewResult.insertId;

        // 2. Chèn dữ liệu vào bảng review_medias
        if (images && images.length > 0) {
            const imageQueries = images.map(img => 
                connection.execute(
                    `INSERT INTO review_medias (review_id, image) VALUES (?, ?)`,
                    [reviewId, img]
                )
            );
            await Promise.all(imageQueries);
        }

        // 3. Cập nhật trạng thái isReview
        await connection.execute(
            `UPDATE order_items SET isReview = 1 WHERE id = ?`,
            [orderItem_id]
        );

        await connection.commit();
        return { success: true, reviewId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getByProductId = async (productId) => {
    try {
        // Sửa ORDER BY r.created_at và dùng Subquery cho review_images
        const [rows] = await db.execute(
            `SELECT 
                r.id, r.user_id, r.product_id, r.content, r.point, r.created_at,
                u.name as user_name, 
                u.avatar as user_avatar,
                (SELECT GROUP_CONCAT(image) FROM review_medias WHERE review_id = r.id) as review_images
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC`,
            [productId]
        );
        return rows;
    } catch (error) {
        throw error;
    }
};

const getAll = async () => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                r.*, 
                u.name as user_name, 
                u.avatar as user_avatar,
                p.name as product_name,
                (SELECT GROUP_CONCAT(image) FROM review_medias WHERE review_id = r.id) as review_images
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC`
        );
        return rows;
    } catch (error) {
        throw error;
    }
};

const deleteById = async (reviewId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lấy danh sách ảnh và orderItem_id trước khi xóa
        const [reviewData] = await connection.execute(
            `SELECT r.orderItem_id, GROUP_CONCAT(rm.image) as images
             FROM reviews r
             LEFT JOIN review_medias rm ON r.id = rm.review_id
             WHERE r.id = ?
             GROUP BY r.id`,
            [reviewId]
        );

        if (reviewData.length === 0) {
            throw new Error('Không tìm thấy đánh giá');
        }

        const { orderItem_id, images } = reviewData[0];
        const imageList = images ? images.split(',') : [];

        // 2. Xóa review (review_medias sẽ tự động xóa nhờ ON DELETE CASCADE trong DB)
        await connection.execute(`DELETE FROM reviews WHERE id = ?`, [reviewId]);

        // 3. Cập nhật lại trạng thái cho phép đánh giá lại ở đơn hàng
        await connection.execute(
            `UPDATE order_items SET isReview = 0 WHERE id = ?`,
            [orderItem_id]
        );

        await connection.commit();
        
        // Trả về danh sách tên ảnh để Service gọi Cloudinary xóa nốt
        return { success: true, images: imageList };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const getByStoreId = async (storeId) => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                r.*, 
                u.name as user_name, 
                u.avatar as user_avatar,
                p.name as product_name,
                (SELECT GROUP_CONCAT(image) FROM review_medias WHERE review_id = r.id) as review_images
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE p.store_id = ?
            ORDER BY r.created_at DESC`,
            [storeId]
        );
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = { create, getByProductId, getByStoreId, getAll, deleteById };