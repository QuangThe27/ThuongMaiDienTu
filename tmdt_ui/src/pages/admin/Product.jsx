import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { Edit3, Trash2, Box, Loader2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/productService';
import Notification from '../../components/Notification';

function Product() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

   useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const result = await getProducts();
                
                setProducts(result.data || []); 
            } catch (error) {
                console.error("Fetch error:", error);
                showNotify('Không thể tải danh sách sản phẩm.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Xóa sản phẩm "${name}"? Thao tác này sẽ xóa vĩnh viễn dữ liệu liên quan!`)) {
            try {
                const response = await deleteProduct(id);
                showNotify(response.message || 'Xóa sản phẩm thành công');
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (err) {
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    return (
        <div className="animate-fade-in relative">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <AdminHeader 
                title="Quản lý Sản phẩm" 
                searchPlaceholder="Tìm tên sản phẩm..." 
                createLink="/quan-ly/them-san-pham" 
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-16">STT</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-24">Ảnh</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">Thông tin sản phẩm</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Trạng thái</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Ngày tạo</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center">
                                        <Loader2 className="animate-spin mx-auto text-indigo-500" />
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400">Chưa có sản phẩm nào.</td>
                                </tr>
                            ) : (
                                products.map((prod, index) => {
                                    // Lấy ảnh chính (isMain = 1) hoặc ảnh đầu tiên trong mảng images
                                    const mainImage = prod.images?.find(img => img.isMain === 1)?.image || prod.images?.[0]?.image;

                                    return (
                                        <tr key={prod.id} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="p-4 text-sm text-center text-gray-400 font-medium">{index + 1}</td>
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-50 flex items-center justify-center">
                                                    {mainImage ? (
                                                        <img 
                                                            src={`${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_PRODUCT}/${mainImage}`}
                                                            alt={prod.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { 
                                                                e.target.style.display = 'none'; // Ẩn thẻ img bị lỗi
                                                                e.target.parentNode.innerHTML = '<div class="text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300" size={20} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 line-clamp-1">{prod.name}</span>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Box size={12} className="text-indigo-400" />
                                                        <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                                                            ID: {prod.id} • Store: {prod.store_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${prod.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {prod.status === 1 ? 'Hoạt động' : 'Ngừng bán'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-500">
                                                {new Date(prod.timestamp).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <Link 
                                                        to={`/quan-ly/chi-tiet-san-pham/${prod.id}`} 
                                                        className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                                                        title="Chi tiết"
                                                    >
                                                        <Edit3 size={16} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(prod.id, prod.name)} 
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Product;