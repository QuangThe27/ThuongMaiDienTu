import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { Edit3, Trash2, Store as StoreIcon, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStores, deleteStore } from '../../services/storeService';
import Notification from '../../components/Notification';

function Store() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                const result = await getStores();
                setStores(result.data);
            } catch {
                showNotify('Không thể tải danh sách cửa hàng.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Xóa cửa hàng "${name}"? Thao tác này không thể hoàn tác!`)) {
            try {
                const response = await deleteStore(id);
                showNotify(response.message);
                setStores(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    const renderStatus = (status) => {
        const config = {
            0: { label: 'Đóng cửa', color: 'bg-red-100 text-red-600' },
            1: { label: 'Hoạt động', color: 'bg-green-100 text-green-600' },
            2: { label: 'Tạm ngưng', color: 'bg-orange-100 text-orange-600' }
        };
        const current = config[status] || config[0];
        return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${current.color}`}>{current.label}</span>;
    };

    return (
        <div className="animate-fade-in relative">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <AdminHeader title="Quản lý Cửa hàng" searchPlaceholder="Tìm tên cửa hàng..." createLink="/quan-ly/them-cua-hang" />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-16">STT</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">Cửa hàng</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">Chủ sở hữu</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Trạng thái</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
                            ) : (
                                stores.map((store, index) => (
                                    <tr key={store.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="p-4 text-sm text-center text-gray-400">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-50">
                                                    {store.logo ? (
                                                        <img src={`${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_STORE}/${store.logo}`} className="w-full h-full object-cover" alt="" />
                                                    ) : <StoreIcon className="m-auto h-full text-gray-300" size={20} />}
                                                </div>
                                                <span className="font-bold text-gray-800">{store.store_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium">{store.owner_name}</td>
                                        <td className="p-4 text-center">{renderStatus(store.status)}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <Link to={`/quan-ly/sua-cua-hang/${store.id}`} className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><Edit3 size={16} /></Link>
                                                <button onClick={() => handleDelete(store.id, store.store_name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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

export default Store;