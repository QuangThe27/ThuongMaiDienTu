import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// 1. Khởi tạo Context với giá trị mặc định để tránh báo đỏ khi gọi useContext
const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // Thêm trạng thái loading để tránh giật giao diện

    useEffect(() => {
        const initializeAuth = () => {
            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('accessToken');

            if (savedUser && token && savedUser !== 'undefined') {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error('Auth init error:', error);
                    localStorage.clear();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
    };

    // 2. Sử dụng useMemo để tối ưu hiệu năng, tránh render lại không cần thiết
    const value = useMemo(
        () => ({
            user,
            isLoggedIn,
            login,
            logout,
            loading,
        }),
        [user, isLoggedIn, loading]
    );

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

// 3. Đảm bảo hook này được export đúng cách
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
