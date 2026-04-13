import React, { useEffect, useState } from 'react';
import SellerHeader from '../../components/SellerHeader';
import { Edit3, Trash2, Box, Loader2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductsByStore, deleteProduct } from '../../services/productService';
import { getStoreByUserId } from '../../services/storeService';
import { useAuth } from '../../contexts/AuthContext';
import Notification from '../../components/Notification';

function SellerProduct() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const initData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                const storeRes = await getStoreByUserId(user.id);
                const storeData = storeRes?.data || storeRes;

                if (storeData && storeData.id) {
                    const productResult = await getProductsByStore(storeData.id);
                    setProducts(productResult.data || []);
                } else {
                    showNotify('Không tìm thấy thông tin cửa hàng của bạn.', 'error');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                if (error.response?.status === 404) {
                    showNotify('Tài khoản này chưa đăng ký cửa hàng.', 'error');
                } else {
                    showNotify('Lỗi khi tải dữ liệu từ máy chủ.', 'error');
                }
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [user?.id]);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" không?`)) {
            try {
                const response = await deleteProduct(id);
                showNotify(response.message || 'Xóa sản phẩm thành công');
                setProducts((prev) => prev.filter((p) => p.id !== id));
            } catch (err) {
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    return (
        <div className="animate-fade-in relative">
            {notification && (
                <Notification {...notification} onClose={() => setNotification(null)} />
            )}

            <SellerHeader
                subTitle="Quản lý kho hàng & danh sách sản phẩm"
                searchPlaceholder="Tìm mã hoặc tên sản phẩm..."
                createLink="/seller/them-san-pham"
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-16">
                                    STT
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-24">
                                    Hình ảnh
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">
                                    Thông tin sản phẩm
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Kho hàng
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Trạng thái
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Ngày đăng
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center">
                                        <Loader2 className="animate-spin mx-auto text-orange-500" />
                                        <p className="text-xs text-gray-400 mt-2">
                                            Đang tải dữ liệu kho hàng...
                                        </p>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400">
                                        Bạn chưa có sản phẩm nào trong gian hàng này.
                                    </td>
                                </tr>
                            ) : (
                                products.map((prod, index) => {
                                    const mainImage =
                                        prod.images?.find((img) => img.isMain === 1)?.image ||
                                        prod.images?.[0]?.image;

                                    return (
                                        <tr
                                            key={prod.id}
                                            className="hover:bg-orange-50/20 transition-colors"
                                        >
                                            <td className="p-4 text-sm text-center text-gray-400 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                                                    {mainImage ? (
                                                        <img
                                                            src={`${
                                                                import.meta.env
                                                                    .VITE_CLOUDINARY_BASE_URL
                                                            }${
                                                                import.meta.env
                                                                    .VITE_CLOUDINARY_PRODUCT
                                                            }/${mainImage}`}
                                                            alt={prod.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentNode.innerHTML =
                                                                    '<div class="text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <ImageIcon
                                                            className="text-gray-200"
                                                            size={20}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-gray-800 line-clamp-1">
                                                    {prod.name}
                                                </span>
                                            </td>
                                            {/* HIỂN THỊ TỔNG SỐ LƯỢNG TẠI ĐÂY */}
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span
                                                        className={`font-bold ${
                                                            prod.totalStock > 0
                                                                ? 'text-blue-600'
                                                                : 'text-red-500'
                                                        }`}
                                                    >
                                                        {prod.totalStock?.toLocaleString() || 0}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 uppercase font-medium">
                                                        Sản phẩm
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                        prod.status === 1
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-red-100 text-red-600'
                                                    }`}
                                                >
                                                    {prod.status === 1 ? 'Đang hoạt động' : 'Đã ẩn'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-500 font-medium">
                                                {new Date(
                                                    prod.timestamp || prod.created_at
                                                ).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-1">
                                                    <Link
                                                        to={`/seller/sua-san-pham/${prod.id}`}
                                                        className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                                                        title="Sửa sản phẩm"
                                                    >
                                                        <Edit3 size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(prod.id, prod.name)
                                                        }
                                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <Trash2 size={18} />
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

export default SellerProduct;
