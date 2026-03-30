const ReviewModel = require('./review.model');
const { deleteImage } = require('../../config/cloudinary');

const createReview = async (body, files) => {
    const { user_id, product_id, orderItem_id, content, point } = body;

    if (!user_id || !product_id || !orderItem_id || !point) {
        throw new Error('Vui lòng cung cấp đầy đủ thông tin bắt buộc.');
    }

    const images = files ? files.map(file => {
        const parts = file.filename.split('/');
        return parts[parts.length - 1];
    }) : [];

    try {
        const reviewData = { user_id, product_id, content, point };
        await ReviewModel.create(reviewData, images, orderItem_id);
        return { message: 'Đánh giá sản phẩm thành công!' };
    } catch (error) {
        throw new Error('Lỗi khi lưu đánh giá: ' + error.message);
    }
};

const getReviewsByProductId = async (productId) => {
    if (!productId) throw new Error('ProductId không hợp lệ');
    
    const reviews = await ReviewModel.getByProductId(productId);
    
    return reviews.map(rev => ({
        ...rev,
        // Chuyển chuỗi ảnh thành mảng, nếu NULL thì trả về mảng rỗng
        review_images: rev.review_images ? rev.review_images.split(',') : []
    }));
};

const getAllReviews = async () => {
    const reviews = await ReviewModel.getAll();
    return reviews.map(rev => ({
        ...rev,
        review_images: rev.review_images ? rev.review_images.split(',') : []
    }));
};

const deleteReview = async (reviewId) => {
    if (!reviewId) throw new Error('Review ID không hợp lệ');

    // 1. Xóa trong Database và lấy danh sách ảnh
    const result = await ReviewModel.deleteById(reviewId);

    // 2. Xóa ảnh trên Cloudinary (nếu có)
    if (result.images && result.images.length > 0) {
        // Folder path phải khớp với folderPath lúc upload ở file cloudinary.js
        const folderPath = 'thuongmai/reviews'; 
        
        const deletePromises = result.images.map(publicId => 
            deleteImage(publicId, folderPath)
        );
        
        // Chạy song song việc xóa ảnh để tối ưu tốc độ
        await Promise.all(deletePromises);
    }

    return { success: true, message: 'Xóa đánh giá và ảnh thành công' };
};

const getReviewsByStoreId = async (storeId) => {
    if (!storeId) throw new Error('Store ID là bắt buộc');
    
    const reviews = await ReviewModel.getByStoreId(storeId);
    
    return reviews.map(rev => ({
        ...rev,
        review_images: rev.review_images ? rev.review_images.split(',') : []
    }));
};

module.exports = { 
    createReview, 
    getReviewsByProductId, 
    getAllReviews, 
    getReviewsByStoreId,
    deleteReview 
};