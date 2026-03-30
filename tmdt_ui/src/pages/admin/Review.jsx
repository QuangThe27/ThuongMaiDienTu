import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { Trash2, Star, Loader2, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { getReviews, deleteReview } from '../../services/reviewService';
import Notification from '../../components/Notification';

function Review() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Lấy URL cơ sở từ env để hiển thị ảnh review
    const CLOUDINARY_REVIEW_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_REVIEW}`;

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const result = await getReviews();
            setReviews(result.data);
        } catch {
            showNotify('Không thể tải danh sách đánh giá.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa đánh giá này? Thao tác này sẽ xóa vĩnh viễn dữ liệu và ảnh trên hệ thống.`)) {
            try {
                const response = await deleteReview(id);
                showNotify(response.message || 'Xóa đánh giá thành công');
                setReviews(prev => prev.filter(r => r.id !== id));
            } catch (err) {
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    return (
        <div className="animate-fade-in relative">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <AdminHeader 
                title="Quản lý Đánh giá" 
                searchPlaceholder="Tìm theo nội dung hoặc tên sản phẩm..." 
                // Review thường không có trang "Thêm mới" thủ công từ Admin nên bỏ createLink hoặc để trống
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-16">STT</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-48">Khách hàng / Sản phẩm</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-64">Nội dung đánh giá</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-24">Số sao</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Ảnh</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Ngày tạo</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center">
                                        <Loader2 className="animate-spin mx-auto text-indigo-500" />
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400 font-medium">Chưa có đánh giá nào.</td>
                                </tr>
                            ) : (
                                reviews.map((rev, index) => (
                                    <tr key={rev.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="p-4 text-sm text-center text-gray-400 font-medium">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm uppercase">{rev.user_name}</span>
                                                <span className="text-[10px] text-indigo-500 font-semibold italic">SP: {rev.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare size={14} className="text-gray-300 mt-1 shrink-0" />
                                                <p className="text-sm text-gray-600 line-clamp-2 italic leading-relaxed">
                                                    {rev.content || "Không có nội dung."}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 bg-yellow-50 py-1 rounded-lg border border-yellow-100">
                                                <span className="font-black text-yellow-600 text-xs">{rev.point}</span>
                                                <Star size={10} className="fill-yellow-500 text-yellow-500" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center -space-x-2 overflow-hidden">
                                                {rev.review_images && rev.review_images.length > 0 ? (
                                                    rev.review_images.map((img, i) => (
                                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden border bg-gray-100">
                                                            <img 
                                                                src={`${CLOUDINARY_REVIEW_URL}/${img}`} 
                                                                alt="Review" 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => e.target.src = 'https://via.placeholder.com/100'}
                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-300"><ImageIcon size={16} /></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-[11px] font-bold text-gray-400 uppercase">
                                            {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => handleDelete(rev.id)} 
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Xóa đánh giá"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
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

export default Review;