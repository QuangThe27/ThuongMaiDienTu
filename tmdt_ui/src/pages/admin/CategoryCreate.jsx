import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Layers, Loader2 } from 'lucide-react';
import { createCategory } from '../../services/categoryService';
import Notification from '../../components/Notification';

function CategoryCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({ name: '', status: 0 });

    const showNotify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createCategory(formData);
            showNotify(res.message);
            setTimeout(() => navigate('/quan-ly/danh-muc'), 1500);
        } catch (err) {
            showNotify(err.response?.data?.message || 'Lỗi khi tạo danh mục', 'error');
        } finally { setLoading(false); }
    };

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-indigo-600 mb-4 transition-colors">
                <ArrowLeft size={18} className="mr-1" /> Quay lại
            </button>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                    <Layers className="text-indigo-600" size={28} /> Thêm danh mục mới
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tên danh mục *</label>
                        <input 
                            required 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none" 
                            placeholder="Ví dụ: Đồ gia dụng, Thời trang nam..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái</label>
                        <select 
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: Number(e.target.value)})}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                        >
                            <option value={0}>HOẠT ĐỘNG</option>
                            <option value={1}>NGỪNG HOẠT ĐỘNG</option>
                        </select>
                    </div>

                    <button 
                        disabled={loading} 
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Lưu danh mục
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CategoryCreate;