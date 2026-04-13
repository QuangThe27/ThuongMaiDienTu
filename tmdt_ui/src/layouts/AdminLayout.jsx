import React from 'react';
import {
    LayoutDashboard,
    Users,
    Package,
    LogOut,
    ShieldCheck,
    Layers,
    Store,
    Star,
    ShoppingBag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout({ children }) {
    const { logout } = useAuth(); // 3. Lấy hàm logout từ context
    const navigate = useNavigate(); // 4. Khởi tạo navigate

    const menuItems = [
        { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/admin' },
        { icon: <Users size={22} />, label: 'Người dùng', path: '/quan-ly/nguoi-dung' },
        { icon: <Store size={22} />, label: 'Cửa hàng', path: '/quan-ly/cua-hang' },
        { icon: <Layers size={22} />, label: 'Danh mục', path: '/quan-ly/danh-muc' },
        { icon: <Package size={22} />, label: 'Sản phẩm', path: '/quan-ly/san-pham' },
        { icon: <ShoppingBag size={22} />, label: 'Đơn hàng', path: '/quan-ly/don-hang' },
        { icon: <Star size={22} />, label: 'Đánh giá', path: '/quan-ly/danh-gia' },
    ];

    // 5. Hàm xử lý đăng xuất
    const handleLogout = () => {
        logout(); // Xóa user, token trong localStorage và cập nhật state
        navigate('/dang-nhap'); // Chuyển hướng về trang đăng nhập
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* SIDEBAR - WIDTH NHỎ HƠN (W-24) */}
            <aside className="w-30 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm">
                {/* Logo Section - Cố định ở trên */}
                <div className="flex flex-col items-center py-6 border-b border-gray-50 gap-1">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                        Admin
                    </span>
                </div>

                {/* NAVIGATION - CÓ THỂ CUỘN ĐỘC LẬP */}
                <nav className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.path}
                            className="flex flex-col items-center justify-center gap-1.5 px-2 py-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group mx-2 rounded-xl"
                        >
                            <span className="group-hover:scale-110 transition-transform">
                                {item.icon}
                            </span>
                            {/* Label: 1 dòng, ẩn phần thừa */}
                            <span className="text-[10px] font-bold text-center w-full truncate px-1 uppercase tracking-tighter">
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>

                {/* Bottom Section - Cố định ở dưới */}
                <div className="py-6 border-t border-gray-100">
                    {/* 6. Gán hàm handleLogout vào sự kiện onClick */}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center gap-1 w-full text-red-400 hover:text-red-600 transition-all group"
                    >
                        <LogOut size={20} />
                        <span className="text-[10px] font-bold uppercase">Thoát</span>
                    </button>
                </div>
            </aside>

            {/* CONTENT AREA */}
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>

            {/* Thêm CSS thủ công cho no-scrollbar nếu cần */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `,
                }}
            />
        </div>
    );
}

export default AdminLayout;
