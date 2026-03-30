const ReviewService = require('./review.service');

const create = async (req, res) => {
    try {
        // req.files chứa mảng các ảnh từ uploadReview.array()
        const result = await ReviewService.createReview(req.body, req.files);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getByProductId = async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await ReviewService.getReviewsByProductId(id);
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAll = async (req, res) => {
    try {
        const data = await ReviewService.getAllReviews();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await ReviewService.deleteReview(id);
        res.status(200).json({ success: true, message: 'Xóa đánh giá thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getByStore = async (req, res) => {
    try {
        const { id } = req.params; 
        const data = await ReviewService.getReviewsByStoreId(id);
        
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { create, getByProductId, getAll, remove, getByStore };