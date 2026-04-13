const ProductService = require('./product.service');

const getAll = async (req, res) => {
    try {
        const products = await ProductService.getAllProducts();
        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sản phẩm',
            error: error.message,
        });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getProductById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm',
            });
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết sản phẩm',
            error: error.message,
        });
    }
};

const getByStore = async (req, res) => {
    try {
        const { id } = req.params;

        const products = await ProductService.getProductsByStoreId(id);

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống',
            error: error.message,
        });
    }
};

const getByCategory = async (req, res) => {
    try {
        const { id } = req.params; // category_id
        const products = await ProductService.getProductsByCategory(id);

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sản phẩm theo danh mục',
            error: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await ProductService.deleteProduct(id);

        if (!isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm để xóa hoặc sản phẩm không tồn tại',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm và các dữ liệu liên quan thành công',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi xóa sản phẩm',
            error: error.message,
        });
    }
};

const createProduct = async (req, res) => {
    try {
        // Lấy store_id từ req.body (do Frontend gửi qua FormData)
        const { name, category_id, store_id, descriptions, variants, mainImageIndex, status } =
            req.body;

        // Validation cơ bản
        if (!name)
            return res
                .status(400)
                .json({ success: false, message: 'Tên sản phẩm không được để trống' });
        if (!category_id)
            return res.status(400).json({ success: false, message: 'Vui lòng chọn danh mục' });
        if (!store_id)
            return res.status(400).json({ success: false, message: 'Không tìm thấy mã cửa hàng' });

        if (!req.files || req.files.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: 'Sản phẩm phải có ít nhất 1 hình ảnh' });
        }

        // Parse dữ liệu JSON từ String (vì FormData gửi qua là String)
        let parsedDescriptions = [];
        let parsedVariants = [];
        try {
            parsedDescriptions =
                typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions || [];
            parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants || [];
        } catch (e) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu mô tả hoặc biến thể không đúng định dạng',
            });
        }

        const productData = {
            name,
            category_id: parseInt(category_id),
            store_id: parseInt(store_id), // SỬ DỤNG STORE_ID TỪ FRONTEND
            status: status !== undefined ? parseInt(status) : 1,
            mainImageIndex: parseInt(mainImageIndex) || 0,
        };

        const productId = await ProductService.createProduct(
            productData,
            req.files,
            parsedDescriptions,
            parsedVariants
        );

        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: { productId },
        });
    } catch (error) {
        console.error('Lỗi Controller:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi thêm sản phẩm',
            error: error.message,
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            category_id,
            descriptions,
            variants,
            existingImages,
            mainImageIndex,
            status,
        } = req.body;

        const parsedDescriptions =
            typeof descriptions === 'string' ? JSON.parse(descriptions) : descriptions || [];
        const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants || [];
        const parsedExistingImages =
            typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages || [];

        const productData = {
            name,
            category_id: parseInt(category_id),
            status: parseInt(status),
            mainImageIndex: parseInt(mainImageIndex),
        };

        await ProductService.updateProduct(
            id,
            productData,
            req.files,
            parsedDescriptions,
            parsedVariants,
            parsedExistingImages
        );

        res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBestSeller = async (req, res) => {
    try {
        const data = await ProductService.getBestSellingProduct();
        res.status(200).json({
            status: 'success',
            data,
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: error.message,
        });
    }
};

module.exports = {
    getAll,
    getById,
    getByStore,
    deleteProduct,
    createProduct,
    updateProduct,
    getByCategory,
    getBestSeller,
};
