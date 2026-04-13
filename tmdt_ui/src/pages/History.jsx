import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrderByUserId, deleteOrder } from '../services/orderService';
import {
    ShoppingBag,
    Clock,
    Package,
    Truck,
    CheckCircle,
    ChevronRight,
    AlertCircle,
    XCircle,
    Loader2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function History() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // Lưu ID đơn đang xử lý

    const getStatusInfo = (status) => {
        const statuses = {
            0: {
                label: 'Đặt thành công',
                color: 'bg-blue-100 text-blue-600',
                icon: <Clock size={14} />,
            },
            1: {
                label: 'Đang chuẩn bị',
                color: 'bg-yellow-100 text-yellow-600',
                icon: <Package size={14} />,
            },
            2: {
                label: 'Đang giao hàng',
                color: 'bg-orange-100 text-orange-600',
                icon: <Truck size={14} />,
            },
            3: {
                label: 'Giao thành công',
                color: 'bg-green-100 text-green-600',
                icon: <CheckCircle size={14} />,
            },
        };
        return (
            statuses[status] || {
                label: 'Không xác định',
                color: 'bg-gray-100 text-gray-600',
                icon: <AlertCircle size={14} />,
            }
        );
    };

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const res = await getOrderByUserId(user.id);
            if (res.status === 'success') setOrders(res.data);
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    // Hàm xử lý Hủy đơn
    const handleCancel = async (orderId) => {
        // Đã bỏ window.confirm theo yêu cầu
        setActionLoading(orderId);
        try {
            const res = await deleteOrder(orderId);
            if (res.status === 'success') {
                // Xóa trực tiếp khỏi state để UI cập nhật ngay lập tức
                setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
                // Đã bỏ alert thành công
            }
        } catch (error) {
            // Giữ lại log lỗi ở console để bạn dễ debug nếu có vấn đề
            console.error('Lỗi khi hủy đơn hàng:', error.response?.data?.message || error.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading)
        return (
            <div className="pt-40 text-center font-black uppercase animate-pulse italic">
                Đang tải lịch sử đơn hàng...
            </div>
        );

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-4 border-black pb-6 gap-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                            Lịch sử <span className="text-sky-500">Đơn hàng</span>
                        </h1>
                        <p className="text-gray-400 font-bold text-sm uppercase mt-2 tracking-widest">
                            Số lượng đơn: {orders.length}
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="text-xs font-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all uppercase"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200">
                        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-bold uppercase italic">
                            Bạn chưa có đơn hàng nào.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const statusObj = getStatusInfo(order.status);
                            // ĐIỀU KIỆN HIỆN NÚT HỦY: status = 0 và payment_status = 0
                            const canCancel = order.status === 0 && order.payment_status === 0;

                            return (
                                <div
                                    key={order.id}
                                    className="group border-2 border-gray-100 hover:border-black transition-all shadow-sm hover:shadow-md"
                                >
                                    <div className="flex flex-wrap items-center justify-between p-6 bg-white border-b border-gray-100">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400">
                                                    Mã đơn hàng
                                                </p>
                                                <p className="font-black text-lg">
                                                    #ORD-{order.id}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400">
                                                    Ngày đặt
                                                </p>
                                                <p className="font-bold text-sm">
                                                    {new Date(order.created_at).toLocaleDateString(
                                                        'vi-VN'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase rounded-full ${statusObj.color}`}
                                            >
                                                {statusObj.icon} {statusObj.label}
                                            </span>
                                            <span
                                                className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                                                    order.payment_status === 1
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-red-100 text-red-600'
                                                }`}
                                            >
                                                {order.payment_status === 1
                                                    ? 'Đã thanh toán'
                                                    : 'Chưa thanh toán'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/30">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase text-gray-400">
                                                Người nhận
                                            </p>
                                            <p className="text-sm font-bold">
                                                {order.name} - {order.phone}
                                            </p>
                                            <p className="text-sm text-gray-500 italic mt-1">
                                                {order.address}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-gray-400">
                                                Tổng cộng
                                            </p>
                                            <p className="text-2xl font-black text-sky-600">
                                                {Number(order.total_price).toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            {canCancel && (
                                                <button
                                                    disabled={actionLoading === order.id}
                                                    onClick={() => handleCancel(order.id)}
                                                    className="flex items-center gap-2 bg-red-50 text-red-600 border-2 border-red-600 px-4 py-3 font-black text-xs uppercase hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    {actionLoading === order.id ? (
                                                        <Loader2
                                                            size={16}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                    Hủy đơn
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    navigate(`/thong-tin-don-hang/${order.id}`)
                                                }
                                                className="flex items-center gap-2 bg-white border-2 border-black px-6 py-3 font-black text-xs uppercase hover:bg-black hover:text-white transition-all group-hover:translate-x-1"
                                            >
                                                Chi tiết <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default History;
