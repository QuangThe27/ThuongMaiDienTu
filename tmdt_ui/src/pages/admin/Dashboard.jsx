import React, { useEffect, useState } from 'react';
import { 
    Users, Store, Package, Layers, 
    TrendingUp, ShieldCheck, AlertCircle, Clock 
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Đăng ký các thành phần của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Import services của bạn
import { getCategories } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { getStores } from '../../services/storeService';
import { getUsers } from '../../services/userService';

function Dashboard() {
    const [data, setData] = useState({
        users: [],
        stores: [],
        products: [],
        categories: [],
        loading: true
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [resU, resS, resP, resC] = await Promise.all([
                    getUsers(), getStores(), getProducts(), getCategories()
                ]);
                setData({
                    users: resU.data || [],
                    stores: resS.data || [],
                    products: resP.data || [],
                    categories: resC.data || [],
                    loading: false
                });
            } catch (err) {
                console.error("Lỗi API:", err);
                setData(prev => ({ ...prev, loading: false }));
            }
        };
        loadDashboardData();
    }, []);

    if (data.loading) return <div className="p-10 text-center font-medium">Đang khởi tạo dữ liệu hệ thống...</div>;

    // --- Cấu hình Biểu đồ Cột (Sản phẩm mỗi Store) ---
    const barData = {
        labels: data.stores.map(s => s.store_name),
        datasets: [{
            label: 'Số lượng sản phẩm',
            data: data.stores.map(s => data.products.filter(p => p.store_id === s.id).length),
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderRadius: 6,
        }]
    };

    // --- Cấu hình Biểu đồ Tròn (Vai trò người dùng) ---
    const doughnutData = {
        labels: ['Admin', 'Seller', 'Customer'],
        datasets: [{
            data: [
                data.users.filter(u => u.role === 1).length,
                data.users.filter(u => u.role === 2).length,
                data.users.filter(u => u.role === 3).length,
            ],
            backgroundColor: ['#4F46E5', '#10B981', '#F59E0B'],
            hoverOffset: 4
        }]
    };

    // --- Cấu hình Biểu đồ Đường (Tăng trưởng - Giả lập) ---
    const lineData = {
        labels: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
        datasets: [{
            fill: true,
            label: 'Cửa hàng mới',
            data: [1, 2, data.stores.length],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            tension: 0.4
        }]
    };

    const cardStyle = "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]";

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen text-gray-800">
            <header className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight">Tổng quan Hệ thống</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <Clock size={16} /> Dữ liệu thời gian thực: {new Date().toLocaleTimeString('vi-VN')}
                </p>
            </header>

            {/* Thẻ thống kê nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className={cardStyle}>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Người dùng</p>
                        <h3 className="text-2xl font-bold">{data.users.length}</h3>
                    </div>
                </div>
                <div className={cardStyle}>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Store /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Cửa hàng</p>
                        <h3 className="text-2xl font-bold">{data.stores.length}</h3>
                    </div>
                </div>
                <div className={cardStyle}>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Package /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Sản phẩm</p>
                        <h3 className="text-2xl font-bold">{data.products.length}</h3>
                    </div>
                </div>
                <div className={cardStyle}>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Layers /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Danh mục</p>
                        <h3 className="text-2xl font-bold">{data.categories.length}</h3>
                    </div>
                </div>
            </div>

            {/* Vùng Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Biểu đồ Cột */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-500" /> Phân bổ sản phẩm theo cửa hàng
                    </h3>
                    <div className="h-80">
                        <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                {/* Biểu đồ Tròn */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Cơ cấu tài khoản</h3>
                    <div className="h-64 flex justify-center">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Hoạt động:</span> <span className="font-bold text-green-600">{data.users.filter(u=>u.status===1).length}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Bị khóa:</span> <span className="font-bold text-red-600">{data.users.filter(u=>u.status===0).length}</span></div>
                    </div>
                </div>
            </div>

            {/* Biểu đồ Sóng & Thông tin bổ sung */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Tăng trưởng Store</h3>
                    <div className="h-64">
                        <Line data={lineData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold mb-6">Cửa hàng mới nhất</h3>
                    <div className="space-y-4">
                        {data.stores.slice(-3).reverse().map(s => (
                            <div key={s.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-indigo-600 uppercase">
                                    {s.store_name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{s.store_name}</p>
                                    <p className="text-xs text-gray-400">Chủ: {s.owner_name}</p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">OPEN</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;