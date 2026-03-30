import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, ArrowLeft, Save, Image as ImageIcon, Loader2, User, Lock, Eye, EyeOff } from 'lucide-react';
import { getUserById, updateUser } from '../../services/userService';
import Notification from '../../components/Notification';

function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện pass

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: '3',
        status: '1',
        password: '', // Thêm trường password
        avatar: null
    });

    const CLOUDINARY_PATH = useMemo(() => 
        `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_AVATAR}/`, 
    []);

    const showNotify = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getUserById(id);
                const user = response.data;
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    role: String(user.role),
                    status: String(user.status),
                    password: '', // Luôn để trống khi load
                    avatar: null 
                });
                if (user.avatar) {
                    setPreview(`${CLOUDINARY_PATH}${user.avatar}`);
                }
            } catch {
                showNotify('Không thể tải thông tin người dùng', 'error');
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id, showNotify, CLOUDINARY_PATH]);

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
            // Chỉ append password nếu người dùng có nhập nội dung
            if (key === 'password') {
                if (formData[key].trim() !== '') {
                    data.append(key, formData[key]);
                }
            } else if (formData[key] !== null && formData[key] !== '') {
                data.append(key, formData[key]);
            }
        });

        try {
            const response = await updateUser(id, data);
            showNotify(response.message || 'Cập nhật thành công!');
            // Reset trường password sau khi cập nhật
            setFormData(prev => ({ ...prev, password: '' }));
            setTimeout(() => navigate('/quan-ly/nguoi-dung'), 1500);
        } catch (err) {
            showNotify(err.response?.data?.message || 'Cập nhật thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="h-96 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            Đang tải dữ liệu...
        </div>
    );

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
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-orange-600 transition-colors mb-2">
                        <ArrowLeft size={18} className="mr-1" /> Quay lại
                    </button>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <Edit3 className="text-orange-500" size={32} />
                        Chỉnh sửa: {formData.name}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    {/* Avatar Section */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4 group">
                            {preview ? (
                                <img src={preview} alt="Profile" className="w-full h-full object-cover rounded-full border-4 border-orange-50 shadow-md" />
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-200">
                                    <User size={32} className="text-gray-300" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full cursor-pointer shadow-lg hover:bg-orange-600 transition-transform hover:scale-110">
                                <ImageIcon size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">ID: #{id}</p>
                    </div>

                    {/* Status Section */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-tighter">Trạng thái tài khoản</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, status: '1' }))}
                                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.status === '1' ? 'bg-green-100 text-green-600 border-2 border-green-200 shadow-sm' : 'bg-gray-50 text-gray-400 border-2 border-transparent'}`}
                            >
                                HOẠT ĐỘNG
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, status: '0' }))}
                                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.status === '0' ? 'bg-red-100 text-red-600 border-2 border-red-200 shadow-sm' : 'bg-gray-50 text-gray-400 border-2 border-transparent'}`}
                            >
                                KHÓA
                            </button>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    {/* Main Form Information */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                            <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email (Không thể sửa)</label>
                            <input name="email" type="email" value={formData.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed outline-none font-medium" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium" />
                        </div>

                        {/* Password Section - Tích hợp mới */}
                        <div className="md:col-span-2 p-5 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                            <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                                <Lock size={16} className="mr-2 text-orange-500" /> 
                                Đặt lại mật khẩu mới
                            </label>
                            <div className="relative">
                                <input 
                                    name="password" 
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password} 
                                    onChange={handleChange}
                                    placeholder="Để trống nếu không muốn đổi"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white focus:bg-white outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium pr-12" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="mt-2 text-[11px] text-gray-400 italic">* Mật khẩu phải từ 6 ký tự trở lên khi thay đổi.</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Vai trò người dùng</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-bold text-gray-700">
                                <option value="1">Quản trị viên (Admin)</option>
                                <option value="2">Người bán (Seller)</option>
                                <option value="3">Khách hàng (Customer)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Save size={20} className="group-hover:scale-110 transition-transform" />
                        )}
                        Xác nhận cập nhật người dùng
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserEdit;