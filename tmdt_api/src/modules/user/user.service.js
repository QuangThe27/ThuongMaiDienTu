const UserModel = require('./user.model');
const { deleteImage } = require('../../config/cloudinary');
const bcrypt = require('bcryptjs');
const getAllUsers = async () => {
    return await UserModel.findAll();
};

const getUserById = async (id) => {
    const user = await UserModel.findById(id);
    if (!user) {
        throw new Error('Người dùng không tồn tại');
    }
    return user;
};

const deleteUserById = async (id) => {
    // Kiểm tra xem user có tồn tại trước khi xóa không
    const user = await UserModel.findById(id);
    if (!user) {
        throw new Error('Không tìm thấy người dùng để xóa');
    }

    const isDeleted = await UserModel.deleteById(id);
    if (!isDeleted) {
        throw new Error('Xóa người dùng thất bại');
    }

    return { message: 'Xóa người dùng và các dữ liệu liên quan thành công' };
};

const createUser = async (data, file) => {
    const existEmail = await UserModel.findAll();

    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    if (file) {
        data.avatar = file.filename.split('/').pop();
    }

    const userId = await UserModel.create(data);
    return { message: 'Tạo người dùng thành công', userId };
};

const updateUser = async (id, data, file) => {
    const user = await UserModel.findById(id);
    if (!user) throw new Error('Người dùng không tồn tại');

    // 1. Xử lý Hash mật khẩu nếu có nhập mật khẩu mới
    if (data.password && data.password.trim() !== '') {
        if (data.password.length < 6) {
            throw new Error('Mật khẩu mới phải từ 6 ký tự trở lên');
        }
        data.password = await bcrypt.hash(data.password, 10);
    } else {
        // Nếu không đổi mật khẩu, xóa trường password khỏi object data để không bị ghi đè rỗng
        delete data.password;
    }

    // 2. Xử lý Avatar
    if (file) {
        if (user.avatar) {
            await deleteImage(user.avatar, 'thuongmai/avatars');
        }
        data.avatar = file.filename.split('/').pop();
    }

    const isUpdated = await UserModel.update(id, data);
    
    // Lưu ý: Nếu người dùng nhấn "Lưu" mà không đổi gì, affectedRows sẽ là 0. 
    // Bạn có thể bỏ qua check này hoặc trả về thông báo phù hợp.
    return { message: 'Cập nhật thông tin thành công' };
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUserById,
    createUser,
    updateUser,
};
