const AuthService = require('./auth.service');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Vui lòng nhập email và mật khẩu',
            });
        }

        const result = await AuthService.login(email, password);

        return res.json({
            message: 'Đăng nhập thành công',
            data: result,
        });
    } catch (error) {
        return res.status(401).json({
            message: error.message,
        });
    }
};

const register = async (req, res) => {
    try {
        const result = await AuthService.register(req.body);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await AuthService.forgotPassword(email);
        return res.json(result);
    } catch (error) {
        return res.status(400).json({
            message: error.message,
        });
    }
};

module.exports = {
    login,
    register,
    forgotPassword,
};
