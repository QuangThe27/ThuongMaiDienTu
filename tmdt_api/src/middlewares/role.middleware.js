// Kiểm tra role == giá trị được truyền vào
const allowRoles = (roles = []) => {
  return (req, res, next) => {
    const userRole = String(req.user.role);

    if (!roles.map(String).includes(userRole)) {
      return res.status(403).json({
        message: 'Bạn không có quyền truy cập',
      });
    }

    next();
  };
};

module.exports = allowRoles;
