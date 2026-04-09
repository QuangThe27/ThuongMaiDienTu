import React, { useEffect, useState, useMemo } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { Eye, Trash2, ShoppingBag, Loader2, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder } from '../../services/orderService';
import Notification from '../../components/Notification';
import * as XLSX from 'xlsx';

function Order() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const result = await getOrders();
                setOrders(result.data || []);
            } catch {
                showNotify('Không thể tải danh sách đơn hàng.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(
            (order) =>
                order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id.toString().includes(searchTerm) ||
                order.phone?.includes(searchTerm)
        );
    }, [orders, searchTerm]);

    const handleExport = () => {
        const dataToExport = filteredOrders.map((o) => ({
            'Mã ĐH': `#${o.id}`,
            'Khách hàng': o.name,
            'Số điện thoại': o.phone,
            'Tổng tiền': new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(o.total_price),
            'Thanh toán': o.payment_status === 1 ? 'Đã thanh toán' : 'Chưa thanh toán',
            'Trạng thái':
                o.status === 3
                    ? 'Hoàn thành'
                    : o.status === 2
                    ? 'Giao hàng'
                    : o.status === 1
                    ? 'Chuẩn bị'
                    : 'Mới',
            'Ngày đặt': new Date(o.created_at).toLocaleString('vi-VN'),
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        XLSX.writeFile(wb, 'Danh_sach_don_hang.xlsx');
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id}?`)) {
            try {
                await deleteOrder(id);
                showNotify('Xóa đơn hàng thành công');
                setOrders((prev) => prev.filter((o) => o.id !== id));
            } catch (err) {
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 0:
                return 'bg-blue-100 text-blue-600'; // Thành công (Mới)
            case 1:
                return 'bg-yellow-100 text-yellow-600'; // Chuẩn bị
            case 2:
                return 'bg-purple-100 text-purple-600'; // Giao hàng
            case 3:
                return 'bg-green-100 text-green-600'; // Hoàn thành
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusText = (status) => {
        const texts = ['Mới', 'Chuẩn bị', 'Giao hàng', 'Hoàn thành'];
        return texts[status] || 'Không xác định';
    };

    return (
        <div className="animate-fade-in relative">
            {notification && (
                <Notification {...notification} onClose={() => setNotification(null)} />
            )}

            <AdminHeader
                title="Quản lý Đơn hàng"
                searchPlaceholder="Tìm mã ĐH, tên khách hàng..."
                onSearch={setSearchTerm}
                showExport={true}
                onExport={handleExport}
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-20">
                                    Mã ĐH
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">
                                    Khách hàng
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Tổng tiền
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Thanh toán
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Trạng thái
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
                                    <td colSpan="7" className="p-10 text-center">
                                        <Loader2 className="animate-spin mx-auto text-indigo-500" />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400">
                                        Không tìm thấy đơn hàng nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-indigo-50/30 transition-colors"
                                    >
                                        <td className="p-4 text-sm text-center font-bold text-indigo-600">
                                            #{order.id}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">
                                                    {order.name}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {order.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-bold text-gray-700">
                                            {new Intl.NumberFormat('vi-VN').format(
                                                order.total_price
                                            )}
                                            đ
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center justify-center gap-1 ${
                                                    order.payment_status === 1
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-orange-100 text-orange-600'
                                                }`}
                                            >
                                                <CreditCard size={10} />
                                                {order.payment_status === 1 ? 'Đã trả' : 'COD'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(
                                                    order.status
                                                )}`}
                                            >
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    to={`/quan-ly/don-hang/${order.id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(order.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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

export default Order;
