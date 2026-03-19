import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

function AdminHeader({ title, onAdd, searchPlaceholder, createLink }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
                    {title}
                </h1>
                <p className="text-sm text-gray-500">Quản lý và cập nhật dữ liệu hệ thống</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder={searchPlaceholder || 'Tìm kiếm...'}
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all text-sm"
                    />
                </div>

                <Link
                    to={createLink}
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-100 transition-all font-bold text-sm"
                >
                    <Plus size={18} />
                    THÊM MỚI
                </Link>
            </div>
        </div>
    );
}

export default AdminHeader;