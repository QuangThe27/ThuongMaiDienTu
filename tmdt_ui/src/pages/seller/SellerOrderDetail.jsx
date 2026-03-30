import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SellerHeader from '../../components/SellerHeader';
import { 
    ArrowLeft, MapPin, Phone, User, Package, 
    Calendar, CreditCard, Loader2, Save 
} from 'lucide-react';
import { getStoreByUserId } from '../../services/storeService';
import { getOrderStoreById, updateStoreOrderStatus } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';
import Notification from '../../components/Notification';

function SellerOrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState(null);
    const [storeId, setStoreId] = useState(null);
    const [newStatus, setNewStatus] = useState(0);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const storeRes = await getStoreByUserId(user.id);
                const sId = storeRes?.data?.id || storeRes?.id;
                setStoreId(sId);

                const result = await getOrderStoreById(sId, orderId);
                setOrder(result.data);
                // Giả định các item cùng shop có status giống nhau trong đơn này
                setNewStatus(result.data.items[0]?.status || 0);
            } catch {
                showNotify('Không thể tải chi tiết đơn hàng', 'error');
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchDetail();
    }, [orderId, user?.id]);

    const handleUpdateStatus = async () => {
        try {
            setUpdating(true);
            await updateStoreOrderStatus(storeId, orderId, newStatus);
            showNotify('Cập nhật trạng thái đơn hàng thành công');
        } catch {
            showNotify('Cập nhật thất bại', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>;
    if (!order) return <div className="text-center p-20 text-gray-500">Không tìm thấy đơn hàng.</div>;

    return (
        <div className="animate-fade-in pb-10">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-orange-600 mb-4 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Quay lại danh sách
            </button>

            <SellerHeader subTitle={`Mã đơn hàng: #${order.id}`} hideCreate={true} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Thông tin sản phẩm */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <Package className="mr-2 text-orange-500" size={20} /> Sản phẩm từ shop của bạn
                            </h3>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold">
                                    <tr>
                                        <th className="p-4">Sản phẩm</th>
                                        <th className="p-4 text-center">Số lượng</th>
                                        <th className="p-4 text-right">Đơn giá</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-800">{item.product_name}</div>
                                                <div className="text-xs text-gray-400">{item.variant_name}: {item.variant_value}</div>
                                            </td>
                                            <td className="p-4 text-center text-gray-600">x{item.quantity}</td>
                                            <td className="p-4 text-right font-bold text-orange-600">
                                                {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Save className="mr-2 text-blue-500" size={20} /> Cập nhật tiến độ
                        </h3>
                        <div className="flex flex-wrap gap-4 items-center">
                            <select 
                                value={newStatus} 
                                onChange={(e) => setNewStatus(parseInt(e.target.value))}
                                className="flex-1 min-w-[200px] p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value={0}>Đang chuẩn bị hàng</option>
                                <option value={1}>Đang bàn giao vận chuyển</option>
                                <option value={2}>Đã hoàn thành</option>
                                <option value={3}>Đơn hàng thất bại/Hủy</option>
                            </select>
                            <button 
                                onClick={handleUpdateStatus}
                                disabled={updating}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center disabled:opacity-50"
                            >
                                {updating ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                                Lưu trạng thái
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Thông tin khách hàng */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-6 border-b border-gray-50 pb-4">Thông tin giao hàng</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mr-4 flex-shrink-0">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Người nhận</p>
                                    <p className="font-bold text-gray-800">{order.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mr-4 flex-shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Số điện thoại</p>
                                    <p className="font-bold text-gray-800">{order.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 mr-4 flex-shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Địa chỉ</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">{order.address}</p>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-50 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 flex items-center"><Calendar size={14} className="mr-1"/> Ngày đặt:</span>
                                    <span className="font-medium text-gray-700">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 flex items-center"><CreditCard size={14} className="mr-1"/> Thanh toán:</span>
                                    <span className="font-medium text-green-600">COD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerOrderDetail;