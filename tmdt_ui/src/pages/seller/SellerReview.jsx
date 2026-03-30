import React, { useEffect, useState } from 'react';
import SellerHeader from '../../components/SellerHeader';
import { Trash2, Star, Loader2, MessageSquare, Image as ImageIcon, User } from 'lucide-react';
import { getReviewsByStore, deleteReview } from '../../services/reviewService';
import { getStoreByUserId } from '../../services/storeService';
import { useAuth } from '../../contexts/AuthContext';
import Notification from '../../components/Notification';

function SellerReview() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const CLOUDINARY_REVIEW_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_REVIEW}`;

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const initData = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                // Bước 1: Lấy Store ID của Seller
                const storeRes = await getStoreByUserId(user.id);
                const storeData = storeRes?.data || storeRes;

                if (storeData && storeData.id) {
                    // Bước 2: Lấy Review thuộc Store đó
                    const result = await getReviewsByStore(storeData.id);
                    setReviews(result.data || []);
                }
            } catch {
                showNotify('Không thể tải danh sách đánh giá.', 'error');
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [user?.id]);

    const handleDelete = async (id) => {
        if (window.confirm(`Xác nhận xóa đánh giá này? Hành động này không thể hoàn tác.`)) {
            try {
                const response = await deleteReview(id);
                showNotify(response.message || 'Đã xóa đánh giá');
                setReviews(prev => prev.filter(r => r.id !== id));
            } catch (err) {
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    return (
        <div className="animate-fade-in relative">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <SellerHeader 
                subTitle="Phản hồi & Đánh giá từ khách hàng"
                searchPlaceholder="Tìm kiếm đánh giá..." 
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-16">STT</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-48">Khách hàng</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">Sản phẩm & Nội dung</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-24">Đánh giá</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Hình ảnh</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Ngày nhận</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center">
                                        <Loader2 className="animate-spin mx-auto text-orange-500" />
                                        <p className="text-xs text-gray-400 mt-2">Đang tải phản hồi...</p>
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400 font-medium">Cửa hàng chưa có đánh giá nào.</td>
                                </tr>
                            ) : (
                                reviews.map((rev, index) => (
                                    <tr key={rev.id} className="hover:bg-orange-50/10 transition-colors">
                                        <td className="p-4 text-sm text-center text-gray-400 font-medium">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200 overflow-hidden">
                                                    {rev.user_avatar ? (
                                                        <img src={`${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_AVATAR}/${rev.user_avatar}`} className="w-full h-full object-cover" alt="avatar" />
                                                    ) : <User size={16} />}
                                                </div>
                                                <span className="font-bold text-gray-800 text-xs uppercase">{rev.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="mb-1 text-indigo-600 font-black text-[10px] uppercase">
                                                Sản phẩm: {rev.product_name}
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MessageSquare size={14} className="text-gray-300 mt-1 shrink-0" />
                                                <p className="text-gray-600 italic line-clamp-2 leading-relaxed">
                                                    {rev.content || "Khách hàng không để lại bình luận."}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 bg-yellow-50 py-1.5 px-2 rounded-xl border border-yellow-100">
                                                <span className="font-black text-yellow-600 text-xs">{rev.point}</span>
                                                <Star size={10} className="fill-yellow-500 text-yellow-500" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center -space-x-3 overflow-hidden">
                                               {rev.review_images && rev.review_images.length > 0 ? (
                                                    rev.review_images.map((img, i) => (
                                                        <div key={i} className="inline-block h-10 w-10 ...">
                                                            <img 
                                                                src={`${CLOUDINARY_REVIEW_URL}/${img}`} 
                                                                alt="Review" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-200"><ImageIcon size={20} /></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-[11px] font-bold text-gray-400 uppercase">
                                            {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => handleDelete(rev.id)} 
                                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                    title="Xóa đánh giá"
                                                >
                                                    <Trash2 size={18} />
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

export default SellerReview;