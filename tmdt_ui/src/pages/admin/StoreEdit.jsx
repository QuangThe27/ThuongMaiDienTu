import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Store, Image as ImageIcon, Loader2, User as UserIcon } from 'lucide-react';
import { getStoreById, updateStore } from '../../services/storeService';
import { getUsers } from '../../services/userService';
import Notification from '../../components/Notification';

function StoreEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState(null);
    const [previews, setPreviews] = useState({ logo: null, image_sub: null });
    const [ownerEmail, setOwnerEmail] = useState('');

    const [formData, setFormData] = useState({
        store_name: '',
        description: '',
        status: '1',
        logo: null,
        image_sub: null
    });

    const STORE_PATH = useMemo(() => `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_STORE}/`, []);

    const showNotify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy thông tin store và danh sách user song song
                const [storeRes, usersRes] = await Promise.all([getStoreById(id), getUsers()]);
                const s = storeRes.data;
                const users = usersRes.data;

                setFormData({
                    store_name: s.store_name,
                    description: s.description || '',
                    status: String(s.status),
                    logo: null,
                    image_sub: null
                });

                setPreviews({
                    logo: s.logo ? `${STORE_PATH}${s.logo}` : null,
                    image_sub: s.image_sub ? `${STORE_PATH}${s.image_sub}` : null
                });

                // Tìm email của chủ sở hữu dựa trên user_id của store
                const owner = users.find(u => u.id === s.user_id);
                setOwnerEmail(owner ? owner.email : 'Không xác định');

            } catch {
                showNotify('Lỗi tải dữ liệu', 'error');
            } finally { setFetching(false); }
        };
        fetchData();
    }, [id, showNotify, STORE_PATH]);

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) data.append(key, formData[key]);
        });

        try {
            const res = await updateStore(id, data);
            showNotify(res.message);
            setTimeout(() => navigate('/quan-ly/cua-hang'), 1500);
        } catch (err) {
            showNotify(err.response?.data?.message || 'Lỗi cập nhật', 'error');
        } finally { setLoading(false); }
    };

    if (fetching) return <div className="text-center p-20"><Loader2 className="animate-spin mx-auto text-blue-500" size={40} /></div>;

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-20">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-orange-600 mb-4 transition-colors">
                <ArrowLeft size={18} className="mr-1" /> Quay lại
            </button>
            <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <Store className="text-orange-500" size={32} /> Chỉnh sửa: {formData.store_name}
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    {/* Giữ nguyên phần upload ảnh như cũ */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Logo</label>
                        <div className="relative w-32 h-32 mx-auto border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                            {previews.logo ? <img src={previews.logo} className="w-full h-full object-cover" alt="logo" /> : <ImageIcon className="text-gray-200" size={40} />}
                            <input type="file" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Ảnh bìa</label>
                        <div className="relative aspect-video border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                            {previews.image_sub ? <img src={previews.image_sub} className="w-full h-full object-cover" alt="sub" /> : <ImageIcon className="text-gray-200" size={40} />}
                            <input type="file" onChange={(e) => handleFileChange(e, 'image_sub')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái cửa hàng</label>
                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none outline-none font-bold text-sm">
                            <option value="1">ĐANG HOẠT ĐỘNG</option>
                            <option value="0">ĐÓNG CỬA</option>
                            <option value="2">TẠM NGƯNG</option>
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Chủ sở hữu (Email)</label>
                            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl text-gray-500 italic">
                                <UserIcon size={18} />
                                <span>{ownerEmail} (Không thể thay đổi)</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên cửa hàng</label>
                            <input required value={formData.store_name} onChange={(e) => setFormData({...formData, store_name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-100 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                            <textarea rows="6" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-100 outline-none" />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Cập nhật cửa hàng
                    </button>
                </div>
            </form>
        </div>
    );
}

export default StoreEdit;