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
    ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStoreByUserId } from '../services/storeService';
import { getCategories } from '../services/categoryService';
import { getCartByUserId } from '../services/cartService';

function Header() {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userStoreId, setUserStoreId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const cateRes = await getCategories();
                if (cateRes && cateRes.data) setCategories(cateRes.data);

                if (isLoggedIn && user) {
                    if (user.role === 2) {
                        const storeRes = await getStoreByUserId(user.id);
                        if (storeRes && storeRes.data) setUserStoreId(storeRes.data.id);
                    }
                    const cartRes = await getCartByUserId(user.id);
                    if (cartRes && cartRes.data) setCartCount(cartRes.data.length);
                } else {
                    setCartCount(0);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu Header:", error);
            }
        };
        fetchInitialData();
    }, [isLoggedIn, user]);

    const formatCount = (count) => (count > 99 ? '99+' : count);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        setCartCount(0);
        navigate('/dang-nhap');
    };

    return (
        <header className="w-full absolute top-0 left-0 z-50 bg-black/10 backdrop-blur-sm border-b border-white/10 transition-all duration-300">
            <div className="text-white px-4 py-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black tracking-tighter flex-shrink-0">
                        MY<span className="text-sky-400">LOGO</span>
                    </Link>

                    <nav className="hidden md:flex space-x-8 font-bold items-center h-full">
                        <Link to="/" className="hover:text-sky-300 transition-colors uppercase text-sm tracking-wide">
                            Trang chủ
                        </Link>

                        {/* --- PHẦN DANH MỤC ĐÃ SỬA --- */}
                        <div className="relative group">
                            {/* Nút trigger có thêm py-4 để mở rộng vùng nhận diện chuột xuống dưới */}
                            <button className="flex items-center hover:text-sky-300 transition-colors uppercase text-sm tracking-wide outline-none py-2">
                                Danh mục <ChevronDown size={14} className="ml-1 group-hover:rotate-180 transition-transform duration-300" />
                            </button>
                            
                            {/* 1. group-hover:block: Hiển thị khi hover vào cha 
                                2. pt-4: Tạo vùng đệm "tàng hình" để chuột di chuyển không bị mất focus
                            */}
                            <div className="absolute hidden group-hover:block left-1/2 -translate-x-1/2 top-full w-[650px] pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-white text-gray-800 rounded-xl shadow-2xl p-5 border border-gray-100 overflow-hidden relative">
                                    {/* Mũi tên nhỏ phía trên menu (tùy chọn) */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>
                                    
                                    <div className="grid grid-cols-6 gap-3 relative z-10">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                to={`/san-pham-theo-danh-muc/${cat.id}`}
                                                className="flex flex-col items-center justify-center text-center p-3 text-[13px] font-bold hover:bg-sky-50 hover:text-sky-600 rounded-xl transition-all border border-transparent hover:border-sky-100"
                                            >
                                                <span className="line-clamp-2">{cat.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                    {categories.length === 0 && (
                                        <p className="text-center text-gray-400 text-sm py-4">Đang tải danh mục...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* --- HẾT PHẦN SỬA --- */}

                        <Link 
                            to="/#product-section" 
                            className="hover:text-sky-300 transition-colors uppercase text-sm tracking-wide"
                        >
                            Sản phẩm
                        </Link>
                        
                        <Link to="/support" className="hover:text-sky-300 transition-colors uppercase text-sm tracking-wide">
                            Hỗ trợ
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-6">
                            {!isLoggedIn ? (
                                <div className="flex items-center space-x-4">
                                    <Link to="/dang-nhap" className="flex items-center hover:text-sky-300 font-bold">
                                        <LogIn size={20} className="mr-1" /> Đăng nhập
                                    </Link>
                                    <Link to="/dang-ky" className="flex items-center bg-sky-500 text-white px-5 py-2 rounded-full font-bold hover:bg-sky-600 transition-all shadow-md">
                                        <UserPlus size={20} className="mr-1" /> Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-5">
                                    {/* Cart */}
                                    <div className="relative cursor-pointer hover:text-sky-300 transition-colors">
                                        <Link to='/gio-hang'>
                                            <ShoppingCart size={24} />
                                        </Link>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full border border-white">
                                                {formatCount(cartCount)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Notifications */}
                                    <div className="relative cursor-pointer hover:text-sky-300 transition-colors">
                                        <Bell size={24} />
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                            5
                                        </span>
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
                                            <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 overflow-hidden z-[60]">
                                                <div className="px-4 py-3 border-b border-gray-100 font-bold text-sky-600 bg-sky-50 truncate flex items-center">
                                                    <User size={16} className="mr-2" /> {user?.name}
                                                </div>
                                                <Link to="/lich-su-don-hang" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors">
                                                    <History size={18} className="mr-3 opacity-70" /> Lịch sử
                                                </Link>
                                                
                                                {user?.role === 1 && (
                                                    <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors font-bold text-red-500">
                                                        <ShieldCheck size={18} className="mr-3 opacity-70" /> Quản trị
                                                    </Link>
                                                )}

                                                {user?.role === 2 && (
                                                    <Link to="/seller/thong-ke" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors font-bold text-orange-500">
                                                        <Store size={18} className="mr-3 opacity-70" /> Cửa hàng
                                                    </Link>
                                                )}

                                                {user?.role === 2 && userStoreId && (
                                                    <Link 
                                                        to={`/cua-hang/${userStoreId}`} 
                                                        onClick={() => setIsDropdownOpen(false)} 
                                                        className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors"
                                                    >
                                                        <Store size={18} className="mr-3 text-sky-500" /> My Store
                                                    </Link>
                                                )}

                                                <Link to="/cai-dat" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors">
                                                    <Settings size={18} className="mr-3 opacity-70" /> Cài đặt
                                                </Link>
                                                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 hover:bg-red-50 text-red-600 border-t border-gray-100 transition-colors font-bold">
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