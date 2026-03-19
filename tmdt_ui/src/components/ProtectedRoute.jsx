import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, user, loading } = useAuth();

    // Đợi context load xong dữ liệu từ localStorage
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    // Nếu chưa đăng nhập hoặc role không phải 1 hoặc 2 -> Đá về trang chủ hoặc login
    if (!isLoggedIn || !(user?.role === 1 )) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;