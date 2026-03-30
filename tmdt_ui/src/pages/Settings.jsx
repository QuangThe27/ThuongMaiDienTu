import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Loader2, CheckCircle2, AlertCircle, X, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, updateUser } from '../services/userService';

const Settings = () => {
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '', // Trường mật khẩu mới
        confirmPassword: '', // Để kiểm tra khớp mật khẩu
        avatar: null
    });

    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_AVATAR}`;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (authUser?.id) {
                    const response = await getUserById(authUser.id);
                    const userData = response.data;
                    setFormData(prev => ({
                        ...prev,
                        name: userData.name || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        address: userData.address || '',
                    }));
                    if (userData.avatar) {
                        setPreviewImage(`${CLOUDINARY_URL}/${userData.avatar}`);
                    }
                }
            } catch {
                showStatus('error', "Không thể tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [authUser]);

    const showStatus = (type, text) => {
        setStatusMsg({ type, text });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, avatar: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra logic mật khẩu khớp nhau ở client
        if (formData.password && formData.password !== formData.confirmPassword) {
            return showStatus('error', "Mật khẩu xác nhận không khớp!");
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone || '');
            data.append('address', formData.address || '');
            
            // Chỉ gửi mật khẩu nếu có nhập nội dung
            if (formData.password.trim() !== '') {
                data.append('password', formData.password);
            }

            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }

            const response = await updateUser(authUser.id, data);
            showStatus('success', response.message || "Cập nhật thành công!");
            
            // Reset ô mật khẩu sau khi lưu thành công
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } catch (error) {
            showStatus('error', error.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="animate-spin text-sky-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-28 px-4 relative">
            {/* Status Alert */}
            {statusMsg.text && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center px-6 py-3 rounded-2xl shadow-2xl border transition-all duration-300 animate-in slide-in-from-top-4 ${
                    statusMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                    <span className="font-bold">{statusMsg.text}</span>
                    <button onClick={() => setStatusMsg({ type: '', text: '' })} className="ml-4"><X size={18} /></button>
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-sky-400 to-indigo-500 h-40" />
                <div className="px-8 pb-10">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center -mt-20 mb-10">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-full border-[6px] border-white overflow-hidden bg-gray-100 shadow-xl relative z-10">
                                    {previewImage ? <img src={previewImage} alt="Avatar" className="w-full h-full object-cover" /> : <User size={60} className="m-auto h-full text-gray-300" />}
                                </div>
                                <label className="absolute bottom-2 right-2 z-20 bg-sky-500 p-3 rounded-full text-white cursor-pointer hover:bg-sky-600 shadow-lg border-2 border-white">
                                    <Camera size={22} /><input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Inputs cơ bản */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-sky-400 outline-none transition-all font-medium" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-sky-400 outline-none transition-all font-medium" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-sky-400 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Địa chỉ</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-sky-400 outline-none transition-all font-medium" />
                            </div>

                            {/* Khu vực đổi mật khẩu */}
                            <div className="md:col-span-2 mt-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                                <div className="flex items-center text-gray-800 font-black"><Lock size={18} className="mr-2 text-sky-500" /> Đổi mật khẩu (Để trống nếu không đổi)</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Mật khẩu mới</label>
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-5 py-3 rounded-xl border-2 border-white focus:border-sky-400 outline-none font-medium" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Xác nhận mật khẩu</label>
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-5 py-3 rounded-xl border-2 border-white focus:border-sky-400 outline-none font-medium" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-end">
                            <button type="submit" disabled={isSubmitting} className="group bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-sky-600 transition-all shadow-xl disabled:opacity-50 active:scale-95 flex items-center">
                                {isSubmitting ? <Loader2 size={20} className="mr-3 animate-spin" /> : <Save size={20} className="mr-3" />}
                                Cập nhật tài khoản
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;