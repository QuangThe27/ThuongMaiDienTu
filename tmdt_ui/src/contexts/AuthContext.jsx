import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const AuthContext = createContext({
    user: null,
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
    loading: true,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

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

    // Chỉ render children khi đã kiểm tra xong localStorage để tránh redirect nhầm
    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
