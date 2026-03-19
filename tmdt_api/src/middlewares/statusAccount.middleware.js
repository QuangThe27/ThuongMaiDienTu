// Kiểm tra status != giá trị được truyền vào
const allowStatus = (blockedStatus = []) => {
    return (req, res, next) => {
        const userStatus = String(req.user.isAccount);

        if (blockedStatus.includes(userStatus)) {
            return res.status(403).json({
                message: 'Tài khoản đã bị khóa',
            });
        }

        next();
    };
};

module.exports = allowStatus;
