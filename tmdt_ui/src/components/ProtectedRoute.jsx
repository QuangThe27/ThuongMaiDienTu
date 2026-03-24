import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Thêm prop allowedRoles để kiểm tra động
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang kiểm tra quyền truy cập...</span>
            </div>
        );
    }

    // 1. Kiểm tra đăng nhập
    // 2. Kiểm tra xem role của user có nằm trong danh sách allowedRoles không
    const hasAccess = isLoggedIn && user && allowedRoles.includes(user.role);

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;