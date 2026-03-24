const StoreModel = require('./store.model');
const { deleteImage } = require('../../config/cloudinary');

const getAllStores = async () => {
    return await StoreModel.findAll();
};

const getStoreById = async (id) => {
    const store = await StoreModel.findById(id);
    if (!store) throw new Error('Cửa hàng không tồn tại');
    return store;
};

const getStoreByUserId = async (userId) => {
    const store = await StoreModel.findByUserId(userId);
    if (!store) throw new Error('Tài khoản này chưa đăng ký cửa hàng');
    return store;
};

const createStore = async (data, files) => {
    // 1. Kiểm tra User đã có store chưa
    const existingStore = await StoreModel.findByUserId(data.user_id);
    if (existingStore) throw new Error('Mỗi người dùng chỉ có thể sở hữu 1 cửa hàng');

    // 2. Xử lý file upload
    if (files) {
        if (files.logo) data.logo = files.logo[0].filename.split('/').pop();
        if (files.image_sub) data.image_sub = files.image_sub[0].filename.split('/').pop();
    }

    const storeId = await StoreModel.create(data);
    return { message: 'Tạo cửa hàng thành công', id: storeId };
};

const updateStoreById = async (id, data, files) => {
    const oldStore = await StoreModel.findById(id);
    if (!oldStore) throw new Error('Không tìm thấy cửa hàng');

    // Xử lý ảnh mới và xóa ảnh cũ
    if (files) {
        if (files.logo) {
            if (oldStore.logo) await deleteImage(oldStore.logo, 'thuongmai/stores');
            data.logo = files.logo[0].filename.split('/').pop();
        }
        if (files.image_sub) {
            if (oldStore.image_sub) await deleteImage(oldStore.image_sub, 'thuongmai/stores');
            data.image_sub = files.image_sub[0].filename.split('/').pop();
        }
    }

    const success = await StoreModel.update(id, data);
    if (!success && !files) throw new Error('Không có thay đổi nào được thực hiện');

    return { message: 'Cập nhật cửa hàng thành công' };
};

const deleteStoreById = async (id) => {
    const store = await StoreModel.findById(id);
    if (!store) throw new Error('Cửa hàng không tồn tại');

    if (store.logo) {
        await deleteImage(store.logo, 'thuongmai/stores');
    }

    if (store.image_sub) {
        await deleteImage(store.image_sub, 'thuongmai/stores');
    }

    const success = await StoreModel.deleteById(id);
    if (!success) throw new Error('Lỗi khi xóa dữ liệu trong Database');

    return { message: 'Xóa cửa hàng thành công' };
};

module.exports = { getAllStores, getStoreById, getStoreByUserId, createStore, updateStoreById, deleteStoreById };
