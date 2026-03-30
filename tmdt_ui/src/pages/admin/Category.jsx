import React, { useEffect, useState, useMemo } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { Edit3, Trash2, Layers, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategories, deleteCategory } from '../../services/categoryService';
import Notification from '../../components/Notification';
import * as XLSX from 'xlsx';

function Category() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const result = await getCategories();
                setCategories(result.data || []);
            } catch {
                showNotify('Không thể tải danh sách danh mục.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter(cat =>
            cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleExport = () => {
        const dataToExport = filteredCategories.map((c, index) => ({
            "STT": index + 1,
            "Tên danh mục": c.name,
            "Trạng thái": c.status === 0 ? "Hoạt động" : "Ngừng",
            "Ngày tạo": new Date(c.created_at).toLocaleDateString('vi-VN')
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, "Danh_sach_danh_muc.xlsx");
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Xóa danh mục "${name}"? Thao tác này có thể ảnh hưởng đến sản phẩm!`)) {
            try {
                const response = await deleteCategory(id);
                showNotify(response.message);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch (err) {
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    return (
        <div className="animate-fade-in relative">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <AdminHeader 
                title="Quản lý Danh mục" 
                searchPlaceholder="Tìm tên danh mục..." 
                createLink="/quan-ly/them-danh-muc"
                onSearch={setSearchTerm}
                showExport={true}
                onExport={handleExport}
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-20">STT</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">Tên danh mục</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Trạng thái</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Ngày tạo</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan="5" className="p-10 text-center text-gray-400">Không tìm thấy danh mục.</td></tr>
                            ) : (
                                filteredCategories.map((cat, index) => (
                                    <tr key={cat.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="p-4 text-sm text-center text-gray-400 font-medium">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <Layers size={16} />
                                                </div>
                                                <span className="font-bold text-gray-800">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cat.status === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {cat.status === 0 ? 'Hoạt động' : 'Ngừng'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-sm text-gray-500">
                                            {new Date(cat.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <Link to={`/quan-ly/sua-danh-muc/${cat.id}`} className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"><Edit3 size={16} /></Link>
                                                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Category;