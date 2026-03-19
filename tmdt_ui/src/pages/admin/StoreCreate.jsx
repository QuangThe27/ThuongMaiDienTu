import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Store, Image as ImageIcon, Loader2, Search, User as UserIcon } from 'lucide-react';
import { createStore } from '../../services/storeService';
import { getUsers } from '../../services/userService';
import Notification from '../../components/Notification';

function StoreCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [previews, setPreviews] = useState({ logo: null, image_sub: null });
    
    // State cho tìm kiếm User
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        user_id: '',
        store_name: '',
        description: '',
        status: '1',
        logo: null,
        image_sub: null
    });

    const showNotify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Lấy danh sách user khi mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getUsers();
                setUsers(res.data);
            } catch (err) {
                console.error("Lỗi lấy danh sách user", err);
            }
        };
        fetchUsers();
    }, []);

    // Lọc user theo email dựa trên searchTerm
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return [];
        return users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
    }, [searchTerm, users]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setFormData(prev => ({ ...prev, user_id: user.id }));
        setSearchTerm(user.email);
        setShowDropdown(false);
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.user_id) return showNotify('Vui lòng chọn chủ sở hữu!', 'error');
        
        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            const res = await createStore(data);
            showNotify(res.message);
            setTimeout(() => navigate('/quan-ly/cua-hang'), 1500);
        } catch (err) {
            showNotify(err.response?.data?.message || 'Lỗi tạo cửa hàng', 'error');
        } finally { setLoading(false); }
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-20">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-blue-600 mb-4 transition-colors">
                <ArrowLeft size={18} className="mr-1" /> Quay lại
            </button>
            <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <Store className="text-blue-600" size={32} /> Thiết lập cửa hàng
            </h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Logo</label>
                        <div className="relative w-32 h-32 mx-auto border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                            {previews.logo ? <img src={previews.logo} className="w-full h-full object-cover" alt="logo" /> : <ImageIcon className="text-gray-200" size={40} />}
                            <input type="file" onChange={(e) => handleFileChange(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Ảnh bìa</label>
                        <div className="relative aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                            {previews.image_sub ? <img src={previews.image_sub} className="w-full h-full object-cover" alt="sub" /> : <ImageIcon className="text-gray-200" size={40} />}
                            <input type="file" onChange={(e) => handleFileChange(e, 'image_sub')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        {/* Search Email Field */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tìm chủ sở hữu (Email) *</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                        if (selectedUser) setSelectedUser(null);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Nhập email để tìm kiếm..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-100 outline-none"
                                />
                            </div>

                            {showDropdown && filteredUsers.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    {filteredUsers.map(user => (
                                        <div 
                                            key={user.id} 
                                            onClick={() => handleSelectUser(user)}
                                            className="p-4 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <UserIcon size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedUser && (
                                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                                    <span className="text-xs font-bold text-green-700 uppercase">Đã chọn: {selectedUser.name} (ID: {selectedUser.id})</span>
                                    <button type="button" onClick={() => {setSelectedUser(null); setSearchTerm(''); setFormData({...formData, user_id: ''})}} className="text-xs text-red-500 underline">Xóa</button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tên cửa hàng *</label>
                            <input required value={formData.store_name} onChange={(e) => setFormData({...formData, store_name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Ví dụ: Shop Hoa Quả Sạch" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả cửa hàng</label>
                            <textarea rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Giới thiệu về cửa hàng..." />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Lưu thiết lập
                    </button>
                </div>
            </form>
        </div>
    );
}

export default StoreCreate;