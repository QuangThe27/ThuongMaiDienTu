const UserService = require('./user.service');

const getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        return res.json({
            message: 'Lấy danh sách người dùng thành công',
            data: users,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        return res.json({
            message: 'Lấy thông tin chi tiết thành công',
            data: user,
        });
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserService.deleteUserById(id);
        return res.json(result);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        // req.file do middleware uploadAvatar.single('avatar') tạo ra
        const result = await UserService.createUser(req.body, req.file);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await UserService.updateUser(id, req.body, req.file);
        return res.json(result);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUserById,
    createUser,
    updateUser,
};
