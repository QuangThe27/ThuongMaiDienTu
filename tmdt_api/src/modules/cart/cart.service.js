const CartModel = require('./cart.model');
const { db } = require('../../config/database');
const { getIO } = require('../../config/socket'); // Import để gửi real-time

const emitCartUpdate = (userId) => {
    const io = getIO();
    io.to(`user_${userId}`).emit('cart_updated');
};

const getAllCarts = async () => {
    return await CartModel.findAll();
};

const getCartByUserId = async (user_id) => {
    return await CartModel.findByUserId(user_id);
};

const createCart = async (data) => {
    const variant = await CartModel.findVariantById(data.variant_id);
    if (!variant) throw new Error('Biến thể sản phẩm không tồn tại');

    if (data.quantity > variant.quantity) {
        throw new Error(`Số lượng vượt quá tồn kho (Hiện có: ${variant.quantity})`);
    }

    const existingItem = await CartModel.findCartItem(data.user_id, data.variant_id);
    if (existingItem) {
        const newQuantity = existingItem.quantity + data.quantity;
        if (newQuantity > variant.quantity) {
            throw new Error('Tổng số lượng trong giỏ hàng vượt quá tồn kho');
        }
        await CartModel.updateQuantity(existingItem.id, newQuantity);
        emitCartUpdate(data.user_id); // Báo Real-time
        return { message: 'Đã cập nhật số lượng vào giỏ hàng', id: existingItem.id };
    }

    const insertId = await CartModel.create(data);
    emitCartUpdate(data.user_id); // Báo Real-time
    return { message: 'Thêm vào giỏ hàng thành công', id: insertId };
};

const updateCartQuantity = async (id, quantity) => {
    const [rows] = await db.execute(
        'SELECT c.user_id, c.variant_id, pv.quantity as stock FROM carts c JOIN product_variants pv ON c.variant_id = pv.id WHERE c.id = ?',
        [id]
    );

    if (rows.length === 0) throw new Error('Không tìm thấy giỏ hàng');
    if (quantity > rows[0].stock) throw new Error(`Kho chỉ còn ${rows[0].stock} sản phẩm`);

    await CartModel.updateQuantity(id, quantity);
    emitCartUpdate(rows[0].user_id); // Báo Real-time
    return { message: 'Cập nhật số lượng thành công' };
};

const deleteCartById = async (id) => {
    // Lấy user_id trước khi xóa để gửi socket
    const [item] = await db.execute('SELECT user_id FROM carts WHERE id = ?', [id]);
    if (item.length === 0) throw new Error('Không tìm thấy mục để xóa');

    const affectedRows = await CartModel.deleteById(id);
    emitCartUpdate(item[0].user_id); // Báo Real-time
    return { message: 'Xóa khỏi giỏ hàng thành công' };
};

module.exports = {
    getAllCarts,
    getCartByUserId,
    createCart,
    updateCartQuantity,
    deleteCartById,
};
