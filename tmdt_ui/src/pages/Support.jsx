import React, { useState } from 'react';
import {
    Send,
    Mail,
    X,
    HelpCircle,
    PhoneCall,
    Clock,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import axios from 'axios';

function Support() {
    const { user, isLoggedIn } = useAuth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Tài khoản & Bảo mật',
        message: '',
    });
    const [selectedImages, setSelectedImages] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length + files.length > 5) {
            showNotification('Tối đa chỉ được đính kèm 5 ảnh', 'error');
            return;
        }
        setSelectedImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            showNotification('Vui lòng điền đầy đủ tiêu đề và nội dung', 'error');
            return;
        }

        setLoading(true);
        try {
            // 1. Khởi tạo FormData
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('message', formData.message);

            // 2. Đưa userData vào (phải stringify vì FormData chỉ nhận string/blob)
            if (isLoggedIn) {
                const userPayload = {
                    name: user?.full_name || user?.name || 'Thành viên',
                    email: user?.email,
                    phone: user?.phone || 'Chưa cập nhật',
                };
                data.append('userData', JSON.stringify(userPayload));
            }

            // 3. Đưa danh sách ảnh vào
            selectedImages.forEach((file) => {
                data.append('images', file); // key 'images' phải khớp với upload.array('images') ở backend
            });

            // 4. Gửi với header multipart/form-data
            const response = await axios.post(
                'http://localhost:3000/api/support/send-support',
                data,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            if (response.data.success) {
                showNotification('Gửi yêu cầu hỗ trợ thành công!', 'success');
                setFormData({ title: '', category: 'Tài khoản & Bảo mật', message: '' });
                setSelectedImages([]);
            }
        } catch (error) {
            console.error('Support Error:', error);
            showNotification('Không thể gửi yêu cầu lúc này.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                        Trung tâm <span className="text-sky-500">Hỗ trợ</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">
                        {isLoggedIn
                            ? `Chào ${user?.full_name ||
                                  user?.name}, chúng tôi sẵn sàng giải quyết vấn đề của bạn.`
                            : 'Chúng tôi luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề của bạn 24/7.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Cột trái: Thông tin liên hệ nhanh */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <HelpCircle className="mr-2 text-sky-500" size={24} /> Trợ giúp
                                nhanh
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-sky-50 p-3 rounded-xl mr-4 text-sky-600">
                                        <PhoneCall size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">
                                            Hotline
                                        </p>
                                        <p className="text-gray-900 font-black">1900 123 456</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-purple-50 p-3 rounded-xl mr-4 text-purple-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">
                                            Email
                                        </p>
                                        <p className="text-gray-900 font-black">
                                            support@mylogo.com
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-green-50 p-3 rounded-xl mr-4 text-green-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">
                                            Làm việc
                                        </p>
                                        <p className="text-gray-900 font-black">
                                            Thứ 2 - CN (08:00 - 22:00)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Form soạn thư hỗ trợ */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <span className="font-bold text-gray-700 flex items-center uppercase text-sm tracking-widest">
                                    <Send size={16} className="mr-2 text-sky-500" /> Gửi yêu cầu mới
                                </span>
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                            </div>

                            <div className="p-8">
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {/* Tiêu đề */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                                            Tiêu đề yêu cầu
                                        </label>
                                        <input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="Lỗi thanh toán, Đổi trả hàng, Lỗi đăng nhập..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium text-gray-700"
                                        />
                                    </div>

                                    {/* Danh mục vấn đề */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                                            Loại vấn đề
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all font-medium text-gray-700 appearance-none"
                                        >
                                            <option>Tài khoản & Bảo mật</option>
                                            <option>Đơn hàng & Thanh toán</option>
                                            <option>Chính sách vận chuyển</option>
                                            <option>Khiếu nại người bán</option>
                                            <option>Khác</option>
                                        </select>
                                    </div>

                                    {/* Nội dung chi tiết */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                                            Nội dung chi tiết
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows="6"
                                            placeholder="Mô tả chi tiết tình huống của bạn..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none transition-all font-medium text-gray-700 resize-none"
                                        ></textarea>
                                        {isLoggedIn && (
                                            <p className="mt-2 text-xs text-sky-600 font-bold italic">
                                                * Thông tin liên hệ ({user?.email}) sẽ được gửi kèm
                                                tự động.
                                            </p>
                                        )}
                                    </div>

                                    {/* Upload ảnh */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
                                            Đính kèm minh chứng
                                        </label>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all text-gray-400 hover:text-sky-500">
                                                <ImageIcon size={24} />
                                                <span className="text-[10px] font-bold uppercase mt-1">
                                                    Thêm ảnh
                                                </span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    hidden
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                />
                                            </label>

                                            {selectedImages.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="relative w-24 h-24 rounded-2xl overflow-hidden group border border-gray-100 shadow-sm"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nút Gửi */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`flex items-center space-x-2 bg-sky-500 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg uppercase tracking-widest text-sm ${
                                                loading
                                                    ? 'opacity-70 cursor-not-allowed'
                                                    : 'hover:bg-sky-600 hover:shadow-sky-200 active:scale-95'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span>Đang xử lý...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Gửi yêu cầu ngay</span>
                                                    <Send size={18} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Support;
