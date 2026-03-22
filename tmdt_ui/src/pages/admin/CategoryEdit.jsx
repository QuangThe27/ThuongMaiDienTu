import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Layers, Loader2 } from 'lucide-react';
import { getCategoryById, updateCategory } from '../../services/categoryService';
import Notification from '../../components/Notification';

function CategoryEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({ name: '', status: 0 });

    const showNotify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await getCategoryById(id);
                setFormData({
                    name: res.data.name,
                    status: res.data.status
                });
            } catch {
                showNotify('Lỗi khi tải dữ liệu danh mục', 'error');
            } finally { setFetching(false); }
        };
        fetchCategory();
    }, [id, showNotify]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateCategory(id, formData);
            showNotify(res.message);
            setTimeout(() => navigate('/quan-ly/danh-muc'), 1500);
        } catch (err) {
            showNotify(err.response?.data?.message || 'Lỗi khi cập nhật', 'error');
        } finally { setLoading(false); }
    };

    if (fetching) return <div className="text-center p-20"><Loader2 className="animate-spin mx-auto text-indigo-500" size={40} /></div>;

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-indigo-600 mb-4 transition-colors">
                <ArrowLeft size={18} className="mr-1" /> Quay lại
            </button>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                    <Layers className="text-orange-500" size={28} /> Chỉnh sửa danh mục
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tên danh mục</label>
                        <input 
                            required 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-100 outline-none" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: Number(e.target.value)})}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-100 outline-none font-medium"
                        >
                            <option value={0}>HOẠT ĐỘNG</option>
                            <option value={1}>NGỪNG HOẠT ĐỘNG</option>
                        </select>
                    </div>

                    <button 
                        disabled={loading} 
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Cập nhật danh mục
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CategoryEdit;