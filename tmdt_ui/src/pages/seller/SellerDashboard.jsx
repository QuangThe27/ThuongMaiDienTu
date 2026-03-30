import React, { useEffect, useState } from 'react';
import SellerHeader from '../../components/SellerHeader';
import { DollarSign, ShoppingBag, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { getStoreByUserId } from '../../services/storeService';
import { getStoreAnalytics } from '../../services/orderService';
import { useAuth } from '../../contexts/AuthContext';

function SellerDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState({ overview: [], products: [] });
    const [loading, setLoading] = useState(true);

    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const storeRes = await getStoreByUserId(user.id);
                const storeId = storeRes?.data?.id || storeRes?.id;
                const result = await getStoreAnalytics(storeId);
                setData(result.data);
            } catch (error) {
                console.error("Lỗi tải báo cáo:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchAnalytics();
    }, [user?.id]);

    // Tìm doanh thu theo status (0: Chuẩn bị, 1: Giao, 2: Hoàn thành)
    const getStat = (status) => data.overview.find(item => item.status === status) || { total_revenue: 0, total_orders: 0 };
    const totalRevenue = getStat(2).total_revenue; // Chỉ tính đơn thành công

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-orange-500" /></div>;

    return (
        <div className="animate-fade-in space-y-8">
            <SellerHeader subTitle="Phân tích doanh thu & Hiệu suất bán hàng" hideCreate={true} />

            {/* Chỉ số tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Tổng doanh thu (Thành công)" 
                    value={formatVND(totalRevenue)} 
                    icon={<DollarSign className="text-green-600" />} 
                    bg="bg-green-50" 
                />
                <StatCard 
                    title="Đang giao hàng" 
                    value={formatVND(getStat(1).total_revenue)} 
                    icon={<Clock className="text-blue-600" />} 
                    bg="bg-blue-50" 
                />
                <StatCard 
                    title="Đơn thành công" 
                    value={`${getStat(2).total_orders} đơn`} 
                    icon={<CheckCircle className="text-orange-600" />} 
                    bg="bg-orange-50" 
                />
                <StatCard 
                    title="Sản phẩm đã bán" 
                    value={data.products.reduce((acc, curr) => acc + Number(curr.total_sold), 0)} 
                    icon={<ShoppingBag className="text-purple-600" />} 
                    bg="bg-purple-50" 
                />
            </div>

            {/* Bảng sản phẩm bán chạy */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center">
                        <TrendingUp className="mr-2 text-orange-500" size={20} /> Sản phẩm doanh thu cao nhất
                    </h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[11px] uppercase text-gray-400 font-bold">
                        <tr>
                            <th className="p-4">Tên sản phẩm</th>
                            <th className="p-4 text-center">Đã bán</th>
                            <th className="p-4 text-right">Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-800">{prod.name}</td>
                                <td className="p-4 text-center text-gray-600 font-bold">{prod.total_sold}</td>
                                <td className="p-4 text-right text-orange-600 font-bold">{formatVND(prod.total_revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Component thẻ thống kê nhỏ
function StatCard({ title, value, icon, bg }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center">
            <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

export default SellerDashboard;