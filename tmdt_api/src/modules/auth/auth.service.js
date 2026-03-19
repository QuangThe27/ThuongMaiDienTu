const bcrypt = require('bcryptjs');
const UserModel = require('./auth.model');
const { sendMail } = require('../../utils/mailer');
const { signToken } = require('../../utils/jwt');

const login = async (email, password) => {
    const user = await UserModel.findByEmail(email);

    if (!user) {
        throw new Error('Email không tồn tại trên hệ thống');
    }

    // Kiểm tra trạng thái: 0 là inactive/khóa
    if (user.status === 0) {
        throw new Error('Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Mật khẩu không chính xác');
    }

    const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
    });

    return {
        accessToken: token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            status: user.status,
        },
    };
};

const register = async (data) => {
    const { name, email, password, phone, address } = data;

    if (!name || !email || !password || !phone || !address) {
        throw new Error('Vui lòng nhập đầy đủ thông tin bắt buộc');
    }

    if (password.length < 6) {
        throw new Error('Mật khẩu phải từ 6 ký tự trở lên');
    }

    // Kiểm tra trùng email
    const existEmail = await UserModel.findByEmail(email);
    if (existEmail) {
        throw new Error('Email này đã được đăng ký');
    }

    // Kiểm tra trùng phone
    const existPhone = await UserModel.findByPhone(phone);
    if (existPhone) {
        throw new Error('Số điện thoại này đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await UserModel.createUser({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
    });

    return {
        message: 'Đăng ký tài khoản thành công',
        userId,
    };
};

const forgotPassword = async (email) => {
    if (!email) {
        throw new Error('Vui lòng cung cấp email để lấy lại mật khẩu');
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
        throw new Error('Không tìm thấy tài khoản gắn với email này');
    }

    if (user.status === 0) {
        throw new Error('Tài khoản đang bị khóa, không thể reset mật khẩu');
    }

    // Tạo mật khẩu ngẫu nhiên 6 số
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updatePassword(user.id, hashedPassword);

    await sendMail(
        user.email,
        'Cấp lại mật khẩu mới',
        `
        <h3>Xin chào ${user.name}</h3>
        <p>Hệ thống đã tạo mật khẩu mới cho bạn:</p>
        <h2 style="color: blue;">${newPassword}</h2>
        <p>Vì lý do bảo mật, hãy đổi lại mật khẩu ngay sau khi đăng nhập thành công.</p>
        `
    );

    return {
        message: 'Mật khẩu mới đã được gửi vào hộp thư của bạn',
    };
};

module.exports = {
    login,
    register,
    forgotPassword,
};
