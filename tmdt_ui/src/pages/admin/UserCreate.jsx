import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { createUser } from '../../services/userService';
import Notification from '../../components/Notification';

function UserCreate() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: '3', // Mặc định Customer
        status: '1', // Mặc định Active
        avatar: null
    });

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await createUser(data);
            showNotify(response.message || 'Thêm người dùng thành công!');
            setTimeout(() => navigate('/quan-ly/nguoi-dung'), 1500);
        } catch (err) {
            showNotify(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-2"
                    >
                        <ArrowLeft size={18} className="mr-1" /> Quay lại
                    </button>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <UserPlus className="text-blue-600" size={32} />
                        Thêm người dùng mới
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột trái: Upload Avatar */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4 group">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-full border-4 border-blue-50" />
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <ImageIcon size={32} className="text-gray-300" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all">
                                <ImageIcon size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400">Tải lên ảnh đại diện (JPG, PNG, WebP)</p>
                    </div>
                </div>

                {/* Cột phải: Form thông tin */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên *</label>
                            <input name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="Nguyễn Văn A" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                            <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="email@example.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu *</label>
                            <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="••••••••" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại *</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="090..." />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all">
                                <option value="1">Quản trị viên (Admin)</option>
                                <option value="2">Người bán (Seller)</option>
                                <option value="3">Khách hàng (Customer)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ *</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" placeholder="Số 1, Đường X, Quận Y..." />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Lưu người dùng
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserCreate;