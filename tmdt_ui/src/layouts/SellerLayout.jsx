import React from 'react';
import {
    LayoutDashboard,
    ShoppingBag,
    Boxes,
    ClipboardList,
    MessageSquare,
    Settings,
    LogOut,
    Store,
    TrendingUp,
} from 'lucide-react';

function SellerLayout({ children }) {
    const menuItems = [
        { icon: <TrendingUp size={22} />, label: 'Thống Kê', path: '/seller' },
        { icon: <ClipboardList size={22} />, label: 'Đơn hàng', path: '/seller/don-hang' },
        { icon: <Boxes size={22} />, label: 'Kho hàng', path: '/seller/san-pham' },
        { icon: <ShoppingBag size={22} />, label: 'Đánh giá', path: '/seller/danh-gia' },
        { icon: <MessageSquare size={22} />, label: 'Chat', path: '/seller/danh-sach-tin-nhan' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* SIDEBAR - SELLER STYLE */}
            <aside className="w-30 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm">
                {/* Logo Section - Chuyển sang tông màu Cam của Seller */}
                <div className="flex flex-col items-center py-6 border-b border-gray-50 gap-1">
                    <div className="p-2 bg-orange-500 rounded-lg text-white shadow-orange-100 shadow-lg">
                        <Store size={20} />
                    </div>
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">
                        Seller Center
                    </span>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-1">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.path}
                            className="flex flex-col items-center justify-center gap-1.5 px-2 py-4 text-gray-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all group mx-2 rounded-xl"
                        >
                            <span className="group-hover:scale-110 transition-transform">
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold text-center w-full truncate px-1 uppercase tracking-tighter">
                                {item.label}
                            </span>
                        </a>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="py-6 border-t border-gray-100">
                    <button className="flex flex-col items-center justify-center gap-1 w-full text-gray-400 hover:text-red-500 transition-all group">
                        <LogOut size={20} />
                        <span className="text-[10px] font-bold uppercase">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* CONTENT AREA */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>

            {/* CSS Custom */}
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

export default SellerLayout;
