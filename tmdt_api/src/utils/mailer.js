const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const sendMail = async (to, subject, html, attachments = []) => {
    try {
        const mailOptions = {
            from: `"Hệ thống Thương Mại Điện Tử" <${process.env.MAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attachments,
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Lỗi gửi mail nội bộ:', error);
        throw error;
    }
};

module.exports = {
    sendMail,
};
