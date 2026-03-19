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

    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    if (file) {
        // 1. Xóa ảnh cũ trên Cloudinary nếu có
        if (user.avatar) {
            await deleteImage(user.avatar, 'thuongmai/avatars');
        }
        // 2. Lấy tên ảnh mới
        data.avatar = file.filename.split('/').pop();
    }

    const isUpdated = await UserModel.update(id, data);
    if (!isUpdated) throw new Error('Cập nhật thất bại hoặc không có gì thay đổi');

    return { message: 'Cập nhật người dùng thành công' };
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUserById,
    createUser,
    updateUser,
};
