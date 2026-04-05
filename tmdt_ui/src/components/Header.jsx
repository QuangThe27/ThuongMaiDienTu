import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    ChevronDown,
    Trash2,
    BellOff,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getStoreByUserId } from '../services/storeService';
import { getCategories } from '../services/categoryService';
import { getCartByUserId } from '../services/cartService';
import {
    getNotificationsForUser,
    markAsRead, // Sử dụng hàm markAsRead mới
    deleteNotification,
} from '../services/notificationService';
import socket from '../socket';

function Header() {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();

    // States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const [, setUserStoreId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // Notification States
    const [notifications, setNotifications] = useState([]);
    const notifyRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifyRef.current && !notifyRef.current.contains(event.target)) {
                setIsNotifyOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCartCount = useCallback(async () => {
        if (isLoggedIn && user) {
            try {
                const cartRes = await getCartByUserId(user.id);
                if (cartRes && cartRes.data) {
                    setCartCount(cartRes.data.length);
                }
            } catch (error) {
                console.error('Lỗi khi fetch cart count:', error);
            }
        }
    }, [isLoggedIn, user]);

    const fetchNotifications = useCallback(async () => {
        if (isLoggedIn && user) {
            try {
                const res = await getNotificationsForUser(user.id);
                if (res && res.data) {
                    setNotifications(res.data);
                }
            } catch (error) {
                console.error('Lỗi khi tải thông báo:', error);
            }
        }
    }, [isLoggedIn, user]);

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
                    fetchCartCount();
                    fetchNotifications();

                    socket.emit('join_user_room', user.id);

                    socket.on('cart_updated', () => {
                        fetchCartCount();
                    });

                    socket.off('new_notification');
                    socket.on('new_notification', (newNotify) => {
                        console.log('Nhận thông báo mới:', newNotify);
                        // Khi nhận qua socket, đảm bảo status là 0 (chưa đọc)
                        setNotifications((prev) => [{ ...newNotify, status: 0 }, ...prev]);
                    });
                } else {
                    setCartCount(0);
                    setNotifications([]);
                }
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu Header:', error);
            }
        };

        fetchInitialData();

        return () => {
            socket.off('cart_updated');
            socket.off('new_notification');
        };
    }, [isLoggedIn, user, fetchCartCount, fetchNotifications]);

    // Cập nhật trạng thái đọc (1 = đã đọc, 0 = chưa đọc)
    const handleMarkAsReadInternal = async (id, currentStatus) => {
        if (currentStatus === 1) return; // Nếu đã đọc rồi thì không gọi API nữa
        try {
            await markAsRead(id); // Gọi hàm từ service
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 1 } : n)));
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái:', error);
        }
    };

    const handleDeleteNotify = async (e, id) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error('Lỗi xóa thông báo:', error);
        }
    };

    const handleNotifyClick = async (notify) => {
        // Cập nhật trạng thái dù có path hay không
        await handleMarkAsReadInternal(notify.id, notify.status);
        setIsNotifyOpen(false);
        if (notify.path) {
            navigate(notify.path);
        }
    };

    const formatCount = (count) => (count > 99 ? '99+' : count);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        setIsNotifyOpen(false);
        setCartCount(0);
        setNotifications([]);
        navigate('/dang-nhap');
    };

    // unreadCount dựa trên giá trị 0
    const unreadCount = notifications.filter((n) => n.status === 0).length;

    return (
        <header className="w-full absolute top-0 left-0 z-50 bg-black/10 backdrop-blur-sm border-b border-white/10 transition-all duration-300">
            <div className="text-white px-4 py-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black tracking-tighter flex-shrink-0">
                        MY<span className="text-sky-400">LOGO</span>
                    </Link>

                    <nav className="hidden md:flex space-x-8 font-bold items-center h-full">
                        <Link
                            to="/"
                            className="hover:text-sky-300 transition-colors uppercase text-sm tracking-wide"
                        >
                            Trang chủ
                        </Link>

                        <div className="relative group">
                            <button className="flex items-center hover:text-sky-300 transition-colors uppercase text-sm tracking-wide outline-none py-2">
                                Danh mục{' '}
                                <ChevronDown
                                    size={14}
                                    className="ml-1 group-hover:rotate-180 transition-transform duration-300"
                                />
                            </button>
                            <div className="absolute hidden group-hover:block left-1/2 -translate-x-1/2 top-full w-[650px] pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-white text-gray-800 rounded-xl shadow-2xl p-5 border border-gray-100 overflow-hidden relative">
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
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/#product-section"
                            className="hover:text-sky-300 transition-colors uppercase text-sm tracking-wide"
                        >
                            Sản phẩm
                        </Link>
                        <Link
                            to="/support"
                            className="hover:text-sky-300 transition-colors uppercase text-sm tracking-wide"
                        >
                            Hỗ trợ
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-6">
                            {!isLoggedIn ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/dang-nhap"
                                        className="flex items-center hover:text-sky-300 font-bold"
                                    >
                                        <LogIn size={20} className="mr-1" /> Đăng nhập
                                    </Link>
                                    <Link
                                        to="/dang-ky"
                                        className="flex items-center bg-sky-500 text-white px-5 py-2 rounded-full font-bold hover:bg-sky-600 transition-all shadow-md"
                                    >
                                        <UserPlus size={20} className="mr-1" /> Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-5">
                                    {/* Cart */}
                                    <div className="relative cursor-pointer hover:text-sky-300 transition-colors">
                                        <Link to="/gio-hang">
                                            <ShoppingCart size={24} />
                                        </Link>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] text-white font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full border border-white">
                                                {formatCount(cartCount)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Notification Dropdown */}
                                    <div className="relative" ref={notifyRef}>
                                        <button
                                            onClick={() => {
                                                setIsNotifyOpen(!isNotifyOpen);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="relative cursor-pointer hover:text-sky-300 transition-colors pt-1"
                                        >
                                            <Bell size={24} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white animate-pulse">
                                                    {formatCount(unreadCount)}
                                                </span>
                                            )}
                                        </button>

                                        {isNotifyOpen && (
                                            <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[70] animate-in fade-in slide-in-from-top-3 duration-200">
                                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                                    <h3 className="font-bold text-gray-800 flex items-center">
                                                        Thông báo
                                                        {unreadCount > 0 && (
                                                            <span className="ml-2 px-2 py-0.5 bg-sky-100 text-sky-600 text-[10px] rounded-full">
                                                                {unreadCount} mới
                                                            </span>
                                                        )}
                                                    </h3>
                                                </div>

                                                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                                    {notifications.length > 0 ? (
                                                        notifications.map((notify) => (
                                                            <div
                                                                key={notify.id}
                                                                onClick={() =>
                                                                    handleNotifyClick(notify)
                                                                }
                                                                className={`group relative p-4 border-b border-gray-50 hover:bg-sky-50/50 transition-all cursor-pointer flex gap-3 ${
                                                                    notify.status === 0
                                                                        ? 'bg-sky-50/40'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div
                                                                    className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                                                                        notify.status === 0
                                                                            ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                                                                            : 'bg-transparent'
                                                                    }`}
                                                                />
                                                                <div className="flex-1">
                                                                    <p
                                                                        className={`text-[13px] leading-tight ${
                                                                            notify.status === 0
                                                                                ? 'font-bold text-gray-900'
                                                                                : 'font-medium text-gray-600'
                                                                        }`}
                                                                    >
                                                                        {notify.title}
                                                                    </p>
                                                                    <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                                        {notify.message}
                                                                    </p>
                                                                </div>
                                                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={(e) =>
                                                                            handleDeleteNotify(
                                                                                e,
                                                                                notify.id
                                                                            )
                                                                        }
                                                                        className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-10 flex flex-col items-center justify-center text-gray-400">
                                                            <BellOff
                                                                size={32}
                                                                className="mb-2 opacity-20"
                                                            />
                                                            <p className="text-sm">
                                                                Không có thông báo nào
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* User Account */}
                                    <div className="relative">
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(!isDropdownOpen);
                                                setIsNotifyOpen(false);
                                            }}
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
                                                <Link
                                                    to="/lich-su-don-hang"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors"
                                                >
                                                    <History
                                                        size={18}
                                                        className="mr-3 opacity-70"
                                                    />{' '}
                                                    Lịch sử
                                                </Link>
                                                {user?.role === 1 && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors font-bold text-red-500"
                                                    >
                                                        <ShieldCheck
                                                            size={18}
                                                            className="mr-3 opacity-70"
                                                        />{' '}
                                                        Quản trị
                                                    </Link>
                                                )}
                                                {user?.role === 2 && (
                                                    <Link
                                                        to="/seller/thong-ke"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors font-bold text-orange-500"
                                                    >
                                                        <Store
                                                            size={18}
                                                            className="mr-3 opacity-70"
                                                        />{' '}
                                                        Cửa hàng
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/cai-dat"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="flex items-center px-4 py-2.5 hover:bg-sky-50 transition-colors"
                                                >
                                                    <Settings
                                                        size={18}
                                                        className="mr-3 opacity-70"
                                                    />{' '}
                                                    Cài đặt
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center px-4 py-2.5 hover:bg-red-50 text-red-600 border-t border-gray-100 transition-colors font-bold"
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
