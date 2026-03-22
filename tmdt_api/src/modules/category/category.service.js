const CategoryModel = require('./category.model');

const getAllCategories = async () => {
     return await CategoryModel.findAll();
};

const getCategoryById = async (id) => {
    const category = await CategoryModel.findById(id);
    if (!category) throw new Error('Danh mục không tồn tại');
    return category;
};

const createCategory = async (data) => {
    const existing = await CategoryModel.findByName(data.name);
    if (existing) throw new Error('Tên danh mục này đã tồn tại');

    const categoryId = await CategoryModel.create(data);
    return { message: 'Tạo danh mục thành công', id: categoryId };
};

const updateCategoryById = async (id, data) => {
    const category = await CategoryModel.findById(id);
    if (!category) throw new Error('Danh mục không tồn tại');

    // Nếu cập nhật tên, kiểm tra trùng lặp
    if (data.name && data.name !== category.name) {
        const existing = await CategoryModel.findByName(data.name);
        if (existing) throw new Error('Tên danh mục đã tồn tại');
    }

    const success = await CategoryModel.update(id, data);
    if (!success) throw new Error('Cập nhật thất bại hoặc không có thay đổi');

    return { message: 'Cập nhật danh mục thành công' };
};

const deleteCategoryById = async (id) => {
    const success = await CategoryModel.deleteById(id);
    if (!success) throw new Error('Xóa danh mục thất bại');
    return { message: 'Xóa danh mục thành công' };
};

module.exports = { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategoryById, 
    deleteCategoryById 
};