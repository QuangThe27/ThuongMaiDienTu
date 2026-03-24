const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const createStorage = (folderPath) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folderPath,
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: (req, file) => {
                const name = file.originalname.split('.')[0];
                return `${Date.now()}-${name}`;
            },
        },
    });
};

const deleteImage = async (publicId, folderPath) => {
    try {
        const fullPath = `${folderPath}/${publicId}`;
        await cloudinary.uploader.destroy(fullPath);
    } catch (error) {
        console.error('Lỗi xóa ảnh Cloudinary:', error);
    }
};

// Định nghĩa các loại storage cụ thể
const storageAvatar = createStorage('thuongmai/avatars');
const storageStore = createStorage('thuongmai/stores');
const storageProduct = createStorage('thuongmai/products');
const storageReview = createStorage('thuongmai/reviews');

module.exports = {
    deleteImage,
    uploadAvatar: multer({ storage: storageAvatar }),
    uploadStore: multer({ storage: storageStore }),
    uploadProduct: multer({ storage: storageProduct }),
    uploadReview: multer({ storage: storageReview }),
};
