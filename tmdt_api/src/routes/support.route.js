const express = require('express');
const router = express.Router();
const multer = require('multer'); // Thêm multer
const { sendMail } = require('../utils/mailer');

// Cấu hình multer nhận tối đa 5 ảnh
const upload = multer({ storage: multer.memoryStorage() });

router.post('/send-support', upload.array('images', 5), async (req, res) => {
    try {
        // Khi dùng FormData, các field text nằm trong req.body
        const { title, category, message } = req.body;

        // userData được gửi dưới dạng string JSON, cần parse lại
        const userData = req.body.userData ? JSON.parse(req.body.userData) : null;

        // File ảnh nằm trong req.files
        const files = req.files || [];

        let htmlContent = `
            <h3>Yêu cầu hỗ trợ mới từ khách hàng</h3>
            <p><strong>Loại vấn đề:</strong> ${category}</p>
            <p><strong>Tiêu đề:</strong> ${title}</p>
            <p><strong>Nội dung:</strong></p>
            <blockquote style="background: #f4f4f4; padding: 15px; border-left: 5px solid #0ea5e9;">
                ${message.replace(/\n/g, '<br>')}
            </blockquote>
            <hr />
        `;

        if (userData) {
            htmlContent += `
                <p><strong>Thông tin tài khoản:</strong></p>
                <ul>
                    <li>Họ tên: ${userData.name || 'N/A'}</li>
                    <li>Email: ${userData.email || 'N/A'}</li>
                    <li>Số điện thoại: ${userData.phone || 'N/A'}</li>
                </ul>
            `;
        } else {
            htmlContent += `<p><em>Gửi bởi: Khách vãng lai (Guest)</em></p>`;
        }

        // Tạo mảng attachments cho Nodemailer
        const attachments = files.map((file) => ({
            filename: file.originalname,
            content: file.buffer,
        }));

        // Gọi hàm sendMail (đảm bảo hàm sendMail trong utils/mailer.js có nhận tham số thứ 4 là attachments)
        await sendMail(
            process.env.MAIL_SUPPORT,
            `[HỖ TRỢ] - ${category}: ${title}`,
            htmlContent,
            attachments
        );

        res.status(200).json({ success: true, message: 'Gửi yêu cầu thành công!' });
    } catch (error) {
        console.error('Support error:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống, vui lòng thử lại sau.' });
    }
});

module.exports = router;
