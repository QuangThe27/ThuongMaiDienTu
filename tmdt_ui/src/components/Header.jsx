import React, { useState } from 'react';
import {
    Phone,
    ShoppingCart,
    Bell,
    User,
    Menu,
    X,
    LogIn,
    UserPlus,
    LogOut,
    History,
    Settings,
    ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
    const { isLoggedIn, user, logout } = useAuth(); 
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Dữ liệu demo
    const cartCount = 99;
    const notifyCount = 5;
    const navItems = ['Trang chủ', 'Sản phẩm', 'Dịch vụ', 'Tin tức', 'Liên hệ'];

    const formatCount = (count) => (count > 99 ? '99+' : count);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/dang-nhap');
    };

    return (
        <header className="w-full shadow-md font-sans relative">
            <div className="bg-sky-500 text-white px-4 py-4 relative z-20">
                <div className="container mx-auto flex justify-between items-center">
                    <Link
                        to="/"
                        className="text-2xl font-black tracking-tighter cursor-pointer flex-shrink-0"
                    >
                        MY<span className="text-blue-900">LOGO</span>
                    </Link>

                    <nav className="hidden md:flex space-x-8 font-bold">
                        {navItems.map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="hover:text-blue-900 transition-colors uppercase text-sm tracking-wide"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-6">
                            {!isLoggedIn ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/dang-nhap"
                                        className="flex items-center hover:text-blue-900 font-bold transition-all"
                                    >
                                        <LogIn size={20} className="mr-1" /> Đăng nhập
                                    </Link>
                                    <Link
                                        to="/dang-ky"
                                        className="flex items-center bg-white text-sky-600 px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition-all shadow-md"
                                    >
                                        <UserPlus size={20} className="mr-1" /> Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-5">
                                    <div className="relative cursor-pointer group">
                                        <ShoppingCart size={26} />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-sky-500">
                                                {formatCount(cartCount)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative cursor-pointer">
                                        <Bell size={26} />
                                        {notifyCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-sky-500">
                                                {formatCount(notifyCount)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center space-x-2 focus:outline-none bg-blue-600 p-1 pr-3 rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            <div className="bg-white text-sky-500 p-1.5 rounded-full">
                                                <User size={18} />
                                            </div>
                                            <span className="font-bold text-sm truncate max-w-[100px]">
                                                {user?.name || 'Tài khoản'}
                                            </span>
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl py-2 text-gray-800 z-[100] border border-gray-100 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-gray-100 font-bold text-sky-600 bg-sky-50 truncate">
                                                    {user?.name}
                                                </div>
                                                <a
                                                    href="#"
                                                    className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors"
                                                >
                                                    <History
                                                        size={18}
                                                        className="mr-3 opacity-70"
                                                    />
                                                    Lịch sử
                                                </a>
                                                {(user?.role === 1 || user?.role === 2) && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors"
                                                    >
                                                        <Settings
                                                            size={18}
                                                            className="mr-3 opacity-70"
                                                        />
                                                        Quản lý
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center px-4 py-2.5 hover:bg-red-50 text-red-600 border-t border-gray-100 transition-colors"
                                                >
                                                    <LogOut size={18} className="mr-3" /> Đăng xuất
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
