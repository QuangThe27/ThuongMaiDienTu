import React from 'react';
import { Search, Plus, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function SellerHeader({ onAdd, searchPlaceholder, createLink, subTitle, onSearch }) {
    const { user } = useAuth();

    // Lấy cấu hình Cloudinary từ biến môi trường
    const baseUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;
    const avatarFolder = import.meta.env.VITE_CLOUDINARY_AVATAR;
    
    // Tạo URL ảnh avatar hoàn chỉnh
    const avatarUrl = user?.avatar 
        ? `${baseUrl}${avatarFolder}/${user.avatar}` 
        : null;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* BÊN TRÁI: THÔNG TIN TÀI KHOẢN */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center overflow-hidden shadow-sm">
                    {avatarUrl ? (
                        <img 
                            src={avatarUrl} 
                            alt={user?.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                                e.target.style.display = 'none'; 
                                e.target.parentNode.innerHTML = '<div class="text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                            }}
                        />
                    ) : (
                        <UserIcon className="text-orange-500" size={24} />
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-800 leading-tight uppercase tracking-tight">
                        {user?.name || 'Người bán'}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                        {subTitle || 'Kênh quản lý bán hàng'}
                    </p>
                </div>
            </div>

            {/* BÊN PHẢI: TÌM KIẾM & THÊM MỚI */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder={searchPlaceholder || 'Tìm sản phẩm, đơn hàng...'}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none w-64 transition-all text-sm"
                    />
                </div>

                {createLink && (
                    <Link
                        to={createLink}
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-100 transition-all font-bold text-sm uppercase"
                    >
                        <Plus size={18} />
                        Thêm mới
                    </Link>
                )}
            </div>
        </div>
    );
}

export default SellerHeader;