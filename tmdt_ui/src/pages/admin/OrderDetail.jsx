import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrder } from '../../services/orderService';
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    Phone,
    CreditCard,
    Save,
    Loader2,
    Info,
} from 'lucide-react';
import Notification from '../../components/Notification';

function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState(null);

    // Form state
    const [status, setStatus] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState(0);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                const result = await getOrderById(id);
                setOrder(result.data);
                setStatus(result.data.status);
                setPaymentStatus(result.data.payment_status);
            } catch {
                showNotify('Không thể tải chi tiết đơn hàng', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [id]);

    const handleUpdateStatus = async () => {
        try {
            setUpdating(true);
            await updateOrder(id, {
                status: parseInt(status),
                payment_status: parseInt(paymentStatus),
            });
            showNotify('Cập nhật trạng thái thành công!');
        } catch {
            showNotify('Cập nhật thất bại', 'error');
        } finally {
            setUpdating(false);
        }
    };

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );

    if (!order) return <div className="p-10 text-center font-bold">Đơn hàng không tồn tại.</div>;

    return (
        <div className="animate-fade-in pb-10">
            {notification && (
                <Notification {...notification} onClose={() => setNotification(null)} />
            )}

            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Quay lại danh sách
                </button>
                <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #{order.id}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Thông tin sản phẩm & Khách hàng */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Danh sách sản phẩm */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center gap-2 font-bold text-gray-700">
                            <Package className="text-indigo-500" size={20} /> Danh sách sản phẩm
                        </div>
                        <div className="p-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[11px] uppercase text-gray-400 font-bold border-b border-gray-50">
                                        <th className="text-left pb-4">Sản phẩm</th>
                                        <th className="text-center pb-4">Giá</th>
                                        <th className="text-center pb-4">SL</th>
                                        <th className="text-right pb-4">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800">
                                                        {item.product_name}
                                                    </span>
                                                    <span className="text-xs text-indigo-500 bg-indigo-50 self-start px-2 py-0.5 rounded mt-1">
                                                        {item.variant_name}: {item.variant_value}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center text-sm font-medium text-gray-600">
                                                {new Intl.NumberFormat('vi-VN').format(item.price)}đ
                                            </td>
                                            <td className="py-4 text-center text-sm text-gray-500">
                                                x{item.quantity}
                                            </td>
                                            <td className="py-4 text-right font-bold text-gray-800">
                                                {new Intl.NumberFormat('vi-VN').format(
                                                    item.price * item.quantity
                                                )}
                                                đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Tạm tính:</span>
                                    <span>
                                        {new Intl.NumberFormat('vi-VN').format(
                                            order.total_price - order.ship_price
                                        )}
                                        đ
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Phí vận chuyển:</span>
                                    <span>
                                        {new Intl.NumberFormat('vi-VN').format(order.ship_price)}đ
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-indigo-600 pt-2">
                                    <span>Tổng cộng:</span>
                                    <span>
                                        {new Intl.NumberFormat('vi-VN').format(order.total_price)}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin giao hàng */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-2 font-bold text-gray-700 mb-6 border-b border-gray-50 pb-4">
                            <Info className="text-indigo-500" size={20} /> Thông tin nhận hàng
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase">
                                        Người nhận
                                    </p>
                                    <p className="font-bold text-gray-800">{order.name}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase">
                                        Số điện thoại
                                    </p>
                                    <p className="font-bold text-gray-800">{order.phone}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 md:col-span-2">
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase">
                                        Địa chỉ giao hàng
                                    </p>
                                    <p className="text-gray-700 leading-relaxed">{order.address}</p>
                                    {order.positioning && (
                                        <p className="text-xs text-indigo-500 mt-1 italic">
                                            GPS: {order.positioning}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Cập nhật trạng thái */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <CreditCard size={20} /> Cập nhật trạng thái
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">
                                    Trạng thái giao hàng
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-indigo-500 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-white outline-none"
                                >
                                    <option value={0}>0 - Mới/Thành công</option>
                                    <option value={1}>1 - Đang chuẩn bị</option>
                                    <option value={2}>2 - Đang giao hàng</option>
                                    <option value={3}>3 - Đã hoàn thành</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase opacity-70 mb-1 block">
                                    Tình trạng thanh toán
                                </label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full bg-indigo-500 border-none rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-white outline-none"
                                >
                                    <option value={0}>Chưa thanh toán</option>
                                    <option value={1}>Thanh toán thành công</option>
                                </select>
                            </div>

                            <button
                                onClick={handleUpdateStatus}
                                disabled={updating}
                                className="w-full bg-white text-indigo-600 font-black py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50 mt-2"
                            >
                                {updating ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <Save size={20} />
                                )}
                                LƯU THAY ĐỔI
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase mb-4">
                            Lịch sử đơn hàng
                        </h4>
                        <div className="relative pl-6 space-y-6 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-[2px] before:bg-gray-50">
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                                <p className="text-xs font-bold text-gray-800">
                                    Đặt hàng thành công
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    {new Date(order.created_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-indigo-400 border-2 border-white"></div>
                                <p className="text-xs font-bold text-gray-800">Cập nhật lần cuối</p>
                                <p className="text-[10px] text-gray-400">
                                    {new Date(order.updated_at).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetail;
