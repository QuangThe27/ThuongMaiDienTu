import React, { useEffect, useState } from 'react';
import SellerHeader from '../../components/SellerHeader';
import {
    ClipboardList,
    Eye,
    Truck,
    CheckCircle,
    XCircle,
    Loader2,
    PackageSearch,
    MapPin,
    Phone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStoreByUserId } from '../../services/storeService';
import { getOrdersByStore } from '../../services/orderService'; // Đã đổi hàm
import { useAuth } from '../../contexts/AuthContext';
import Notification from '../../components/Notification';

function SellerOrder() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const statusMap = {
        0: {
            label: 'Đang chuẩn bị',
            color: 'bg-orange-100 text-orange-600',
            icon: <ClipboardList size={12} className="mr-1" />,
        },
        1: {
            label: 'Đang giao',
            color: 'bg-blue-100 text-blue-600',
            icon: <Truck size={12} className="mr-1" />,
        },
        2: {
            label: 'Hoàn thành',
            color: 'bg-green-100 text-green-600',
            icon: <CheckCircle size={12} className="mr-1" />,
        },
        3: {
            label: 'Thất bại',
            color: 'bg-red-100 text-red-600',
            icon: <XCircle size={12} className="mr-1" />,
        },
    };

    const paymentStatusMap = {
        0: {
            label: 'Chưa thanh toán',
            color: 'bg-orange-100 text-orange-600',
            icon: <ClipboardList size={12} className="mr-1" />,
        },
        1: {
            label: 'Hoàn thành',
            color: 'bg-green-100 text-green-600',
            icon: <CheckCircle size={12} className="mr-1" />,
        },
    };

    useEffect(() => {
        const initData = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                // B1: Lấy Store ID của User đang đăng nhập
                const storeRes = await getStoreByUserId(user.id);
                const storeData = storeRes?.data || storeRes;

                if (storeData && storeData.id) {
                    // B2: Chỉ lấy đơn hàng của Store này
                    const result = await getOrdersByStore(storeData.id);
                    setOrders(result.data || []);
                } else {
                    showNotify('Không tìm thấy thông tin cửa hàng.', 'error');
                }
            } catch (error) {
                console.error('Fetch orders error:', error);
                showNotify('Lỗi khi tải danh sách đơn hàng.', 'error');
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [user?.id]);

    return (
        <div className="animate-fade-in relative">
            {notification && (
                <Notification {...notification} onClose={() => setNotification(null)} />
            )}

            <SellerHeader
                subTitle="Quản lý đơn hàng và trạng thái giao nhận"
                searchPlaceholder="Tìm mã đơn hoặc tên khách hàng..."
                hideCreate={true}
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-16">
                                    STT
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-48">
                                    Khách hàng
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">
                                    Địa chỉ nhận hàng
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Tổng tiền
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    TT Order
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    TT PAY
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Ngày đặt
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center">
                                        <Loader2 className="animate-spin mx-auto text-orange-500" />
                                        <p className="text-xs text-gray-400 mt-2">
                                            Đang tải dữ liệu đơn hàng...
                                        </p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center text-gray-400">
                                        <PackageSearch
                                            className="mx-auto mb-2 opacity-20"
                                            size={48}
                                        />
                                        Cửa hàng của bạn chưa có đơn hàng nào.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, index) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-orange-50/20 transition-colors"
                                    >
                                        <td className="p-4 text-sm text-center text-gray-400 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">
                                                    {order.name}
                                                </span>
                                                <div className="flex items-center text-[11px] text-gray-400 mt-1">
                                                    <Phone size={10} className="mr-1" />
                                                    {order.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-start max-w-[250px]">
                                                <MapPin
                                                    size={14}
                                                    className="text-gray-300 mt-1 mr-1 flex-shrink-0"
                                                />
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {order.address}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-sm font-bold text-orange-600">
                                                {formatPrice(order.total_price)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusMap[
                                                    order.status
                                                ]?.color || 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {statusMap[order.status]?.icon}
                                                {statusMap[order.status]?.label || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${paymentStatusMap[
                                                    order.payment_status
                                                ]?.color || 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {paymentStatusMap[order.payment_status]?.icon}
                                                {paymentStatusMap[order.payment_status]?.label ||
                                                    'Không xác định'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-sm text-gray-500 font-medium">
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                <Link
                                                    to={`/seller/don-hang/${order.id}`}
                                                    className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                                                    title="Xem chi tiết đơn hàng"
                                                >
                                                    <Eye size={20} />
                                                </Link>
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

export default SellerOrder;
