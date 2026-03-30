import React, { useState } from 'react';
import { 
    Send, 
    Mail, 
    MessageSquare, 
    Paperclip, 
    Image as ImageIcon, 
    X, 
    HelpCircle, 
    PhoneCall,
    Clock
} from 'lucide-react';

function Support() {
    const [selectedImages, setSelectedImages] = useState([]);

    // Giả lập xử lý chọn ảnh để hiển thị UI preview
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
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
                        Chúng tôi luôn sẵn sàng lắng nghe và giải quyết mọi vấn đề của bạn 24/7.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    
                    {/* Cột trái: Thông tin liên hệ nhanh */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <HelpCircle className="mr-2 text-sky-500" size={24} /> Trợ giúp nhanh
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-sky-50 p-3 rounded-xl mr-4 text-sky-600">
                                        <PhoneCall size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">Hotline</p>
                                        <p className="text-gray-900 font-black">1900 123 456</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-purple-50 p-3 rounded-xl mr-4 text-purple-600">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">Email</p>
                                        <p className="text-gray-900 font-black">support@mylogo.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="bg-green-50 p-3 rounded-xl mr-4 text-green-600">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase">Làm việc</p>
                                        <p className="text-gray-900 font-black">Thứ 2 - CN (08:00 - 22:00)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Form soạn thư hỗ trợ */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            {/* Thanh tiêu đề giả lập cửa sổ email */}
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

                            {/* Nội dung form */}
                            <div className="p-8">
                                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                    {/* Tiêu đề */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Tiêu đề yêu cầu</label>
                                        <input 
                                            type="text" 
                                            placeholder="Vấn đề bạn đang gặp phải (ví dụ: Lỗi thanh toán, Đổi trả hàng...)"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium text-gray-700"
                                        />
                                    </div>

                                    {/* Danh mục vấn đề */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Loại vấn đề</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium text-gray-700 appearance-none">
                                            <option>Tài khoản & Bảo mật</option>
                                            <option>Đơn hàng & Thanh toán</option>
                                            <option>Chính sách vận chuyển</option>
                                            <option>Khiếu nại người bán</option>
                                            <option>Khác</option>
                                        </select>
                                    </div>

                                    {/* Nội dung chi tiết */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Nội dung chi tiết</label>
                                        <textarea 
                                            rows="6" 
                                            placeholder="Mô tả chi tiết tình huống của bạn để admin có thể hỗ trợ nhanh nhất..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all font-medium text-gray-700 resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Upload ảnh/tài liệu đính kèm */}
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2 text-center md:text-left">Đính kèm minh chứng</label>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            {/* Button chọn file */}
                                            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-all text-gray-400 hover:text-sky-500">
                                                <ImageIcon size={24} />
                                                <span className="text-[10px] font-bold uppercase mt-1">Thêm ảnh</span>
                                                <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
                                            </label>

                                            {/* Danh sách ảnh đã chọn */}
                                            {selectedImages.map((file, index) => (
                                                <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                                                    <img 
                                                        src={URL.createObjectURL(file)} 
                                                        alt="preview" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button 
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            <p className="text-xs text-gray-400 w-full md:w-auto font-medium">
                                                * Tối đa 5 ảnh (định dạng JPG, PNG, ...)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Nút Gửi */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button className="flex items-center space-x-2 bg-sky-500 text-white px-10 py-4 rounded-xl font-bold hover:bg-sky-600 transition-all shadow-lg hover:shadow-sky-200 active:scale-95 uppercase tracking-widest text-sm">
                                            <span>Gửi yêu cầu ngay</span>
                                            <Send size={18} />
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