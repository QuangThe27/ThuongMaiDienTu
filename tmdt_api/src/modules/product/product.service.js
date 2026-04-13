const ProductModel = require('./product.model');
const { db } = require('../../config/database');

const getAllProducts = async () => {
    const products = await ProductModel.findAll();

    // Sử dụng Promise.all để lấy dữ liệu liên quan cho tất cả sản phẩm cùng lúc
    const detailedProducts = await Promise.all(
        products.map(async (product) => {
            const [images, variants] = await Promise.all([
                ProductModel.findImagesByProductId(product.id),
                ProductModel.findVariantsByProductId(product.id),
            ]);
            return { ...product, images, variants };
        })
    );

    return detailedProducts;
};

const getProductsByStoreId = async (storeId) => {
    const products = await ProductModel.findAllByStoreId(storeId);

    return await Promise.all(
        products.map(async (product) => {
            const [images, variants] = await Promise.all([
                ProductModel.findImagesByProductId(product.id),
                ProductModel.findVariantsByProductId(product.id),
            ]);

            // Tính tổng số lượng từ các biến thể
            const totalStock = variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);

            return {
                ...product,
                images,
                variants,
                totalStock, // Thêm trường này vào object trả về
            };
        })
    );
};

const getProductById = async (id) => {
    const product = await ProductModel.findById(id);
    if (!product) return null;

    // Lấy chi tiết tất cả thông tin liên quan
    const [images, descriptions, variants] = await Promise.all([
        ProductModel.findImagesByProductId(id),
        ProductModel.findDescriptionsByProductId(id),
        ProductModel.findVariantsByProductId(id),
    ]);

    return {
        ...product,
        images,
        descriptions,
        variants,
    };
};

const getProductsByCategory = async (categoryId) => {
    const products = await ProductModel.findByCategoryId(categoryId);

    const detailedProducts = await Promise.all(
        products.map(async (product) => {
            const [images, variants] = await Promise.all([
                ProductModel.findImagesByProductId(product.id),
                ProductModel.findVariantsByProductId(product.id),
            ]);
            return { ...product, images, variants };
        })
    );

    return detailedProducts;
};

const deleteProduct = async (id) => {
    const isDeleted = await ProductModel.deleteById(id);
    return isDeleted;
};

const createProduct = async (productData, files, descriptions, variants) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Tạo sản phẩm chính
        const productId = await ProductModel.create(productData);

        // 2. Xử lý hình ảnh
        const imagesData = files.map((file, index) => {
            const fileNameOnly = file.filename.split('/').pop();

            return {
                image: fileNameOnly,
                isMain: index === productData.mainImageIndex ? 1 : 0,
            };
        });

        // Bảo vệ: Nếu không có ảnh nào là chính, lấy cái đầu tiên
        if (imagesData.length > 0 && !imagesData.some((img) => img.isMain === 1)) {
            imagesData[0].isMain = 1;
        }

        if (imagesData.length > 0) {
            await ProductModel.insertImages(productId, imagesData);
        }

        // 3. Chèn mô tả
        if (descriptions && descriptions.length > 0) {
            await ProductModel.insertDescriptions(productId, descriptions);
        }

        // 4. Chèn biến thể
        if (variants && variants.length > 0) {
            await ProductModel.insertVariants(productId, variants);
        }

        await connection.commit();
        return productId;
    } catch (error) {
        await connection.rollback();
        console.error('Service Error:', error);
        throw error;
    } finally {
        connection.release();
    }
};

const updateProduct = async (id, productData, files, descriptions, variants, existingImages) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Cập nhật thông tin cơ bản
        await ProductModel.update(id, productData);

        // 2. Xử lý hình ảnh (Kết hợp ảnh cũ giữ lại và ảnh mới upload)
        // existingImages: [{image: 'abc.jpg', isMain: 0}, ...]
        const finalImages = [...existingImages];

        if (files && files.length > 0) {
            files.forEach((file) => {
                finalImages.push({
                    image: file.filename.split('/').pop(),
                    isMain: 0,
                });
            });
        }

        // Reset all isMain and set only the chosen one
        finalImages.forEach((img, idx) => {
            img.isMain = idx === parseInt(productData.mainImageIndex) ? 1 : 0;
        });

        await ProductModel.deleteImagesByProductId(id);
        if (finalImages.length > 0) {
            await ProductModel.insertImages(id, finalImages);
        }

        // 3. Cập nhật Descriptions
        await ProductModel.deleteDescriptionsByProductId(id);
        if (descriptions && descriptions.length > 0) {
            await ProductModel.insertDescriptions(id, descriptions);
        }

        // 4. Cập nhật Variants
        await ProductModel.deleteVariantsByProductId(id);
        if (variants && variants.length > 0) {
            await ProductModel.insertVariants(id, variants);
        }

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Export thêm updateProduct

const getBestSellingProduct = async () => {
    const product = await ProductModel.getBestSeller();
    if (!product) {
        throw new Error('Không có sản phẩm nào khả dụng');
    }
    return product;
};
module.exports = {
    getAllProducts,
    getProductById,
    getProductsByStoreId,
    deleteProduct,
    createProduct,
    updateProduct,
    getProductsByCategory,
    getBestSellingProduct,
};
