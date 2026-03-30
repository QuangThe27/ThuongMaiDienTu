import React, { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Bell,
    User,
    LogIn,
    UserPlus,
    LogOut,
    History,
    Settings,
    Store,
    ShieldCheck,
    LifeBuoy,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStoreByUserId } from '../services/storeService';

function Header() {
    const { isLoggedIn, user, logout } = useAuth(); 
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userStoreId, setUserStoreId] = useState(null);

    useEffect(() => {
        const fetchUserStore = async () => {
            if (isLoggedIn && user?.role === 2) {
                try {
                    const res = await getStoreByUserId(user.id);
                    // Giả sử API trả về { data: { id: ... } } hoặc { id: ... }
                    // Dựa vào format bạn cung cấp ở các service trước, thường là res.data.id
                    if (res && res.data) {
                        setUserStoreId(res.data.id);
                    }
                } catch (error) {
                    console.error("Lỗi lấy thông tin cửa hàng:", error);
                }
            }
        };
        fetchUserStore();
    }, [isLoggedIn, user]);

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
        // Header absolute để đè lên Banner, backdrop-blur tạo lớp mờ nhẹ
        <header className="w-full absolute top-0 left-0 z-50 bg-black/10 backdrop-blur-sm border-b border-white/10 transition-all duration-300">
            <div className="text-white px-4 py-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link
                        to="/"
                        className="text-2xl font-black tracking-tighter cursor-pointer flex-shrink-0"
                    >
                        MY<span className="text-sky-400">LOGO</span>
                    </Link>

                    <nav className="hidden md:flex space-x-8 font-bold">
                        {navItems.map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="hover:text-sky-300 transition-colors uppercase text-sm tracking-wide"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-6">
                            {!isLoggedIn ? (
                                <div className="flex items-center space-x-4">
                                    <Link to="/dang-nhap" className="flex items-center hover:text-sky-300 font-bold transition-all">
                                        <LogIn size={20} className="mr-1" /> Đăng nhập
                                    </Link>
                                    <Link to="/dang-ky" className="flex items-center bg-sky-500 text-white px-5 py-2 rounded-full font-bold hover:bg-sky-600 transition-all shadow-md">
                                        <UserPlus size={20} className="mr-1" /> Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-5">
                                    {/* Cart & Bell */}
                                    <div className="relative cursor-pointer hover:text-sky-300 transition-colors">
                                        <Link to='/gio-hang'>
                                            <ShoppingCart size={24} />
                                        </Link>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                                {formatCount(cartCount)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative cursor-pointer hover:text-sky-300 transition-colors">
                                        <Bell size={24} />
                                        {notifyCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                                {formatCount(notifyCount)}
                                            </span>
                                        )}
                                    </div>

                                    {/* User Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center space-x-2 focus:outline-none bg-white/20 p-1 pr-3 rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <div className="bg-sky-500 text-white p-1.5 rounded-full">
                                                <User size={16} />
                                            </div>
                                            <span className="font-bold text-sm truncate max-w-[100px]">
                                                {user?.name || 'Tài khoản'}
                                            </span>
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-gray-100 font-bold text-sky-600 bg-sky-50 truncate flex items-center">
                                                    <User size={16} className="mr-2" /> {user?.name}
                                                </div>
                                                <Link to="/lich-su-don-hang" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors">
                                                    <History size={18} className="mr-3 opacity-70" /> Lịch sử
                                                </Link>
                                                {user?.role === 1 && (
                                                    <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors">
                                                        <ShieldCheck size={18} className="mr-3 opacity-70" /> Quản lý
                                                    </Link>
                                                )}
                                                {user?.role === 2 && (
                                                    <Link to="/seller" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors">
                                                        <Store size={18} className="mr-3 opacity-70" /> Cửa hàng
                                                    </Link>
                                                )}
                                                {user?.role === 2 && userStoreId && (
                                                    <Link 
                                                        to={`/cua-hang/${userStoreId}`} 
                                                        onClick={() => setIsDropdownOpen(false)} 
                                                        className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors"
                                                    >
                                                        <Store size={18} className="mr-3" /> My Store
                                                    </Link>
                                                )}
                                                <Link to="/cai-dat" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors">
                                                    <Settings size={18} className="mr-3 opacity-70" /> Cài đặt
                                                </Link>
                                                <Link to="/support" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors">
                                                    <LifeBuoy size={18} className="mr-3 opacity-70" /> Hỗ trợ
                                                </Link>
                                                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 hover:bg-red-50 text-red-600 border-t border-gray-100 transition-colors">
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