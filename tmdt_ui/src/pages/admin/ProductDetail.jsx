import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { 
    ArrowLeft, 
    Box, 
    Layers, 
    Tag, 
    Info, 
    Image as ImageIcon, 
    Loader2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { getProductById } from '../../services/productService';
import Notification from '../../components/Notification';

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [activeImage, setActiveImage] = useState(null);

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                const result = await getProductById(id);
                if (result.success) {
                    setProduct(result.data);
                    // Đặt ảnh chính làm ảnh hiển thị mặc định
                    const mainImg = result.data.images?.find(img => img.isMain === 1) || result.data.images?.[0];
                    setActiveImage(mainImg?.image);
                }
            } catch {
                showNotify('Không thể tải chi tiết sản phẩm.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center p-10">
                <p className="text-gray-500">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
                <Link to="/quan-ly/san-pham" className="text-indigo-500 mt-4 inline-block font-bold underline">Quay lại danh sách</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in relative pb-10">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <div className="flex items-center gap-4 mb-6">
                <Link to="/quan-ly/san-pham" className="p-2 bg-white rounded-full border border-gray-100 shadow-sm hover:text-indigo-500 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* CỘT TRÁI: HÌNH ẢNH */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                            {activeImage ? (
                                <img 
                                    src=''
                                    alt="Product" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ImageIcon size={48} className="text-gray-200" />
                            )}
                        </div>
                        
                        {/* Danh sách ảnh phụ */}
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                            {product.images?.map((img, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveImage(img.image)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === img.image ? 'border-indigo-500 shadow-md' : 'border-transparent opacity-60'}`}
                                >
                                    <img src='' className="w-full h-full object-cover" alt="thumb" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Info size={18} className="text-indigo-500" />
                            Thông tin chung
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Trạng thái:</span>
                                {product.status === 1 ? (
                                    <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={14}/> Đang bán</span>
                                ) : (
                                    <span className="text-red-600 font-bold flex items-center gap-1"><XCircle size={14}/> Ngừng bán</span>
                                )}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Ngày tạo:</span>
                                <span className="text-gray-700 font-medium">{new Date(product.timestamp).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">ID Sản phẩm:</span>
                                <span className="text-gray-700 font-medium">#{product.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Tên & Giá */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-lg">ID: {product.category_id}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
                        
                        {/* Hiển thị các biến thể giá */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Tag size={18} className="text-indigo-500" />
                                Thể loại & Giá
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {product.variants?.map((v, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="text-[11px] text-gray-400 uppercase font-bold">{v.variant_name}: {v.variant_value}</div>
                                        <div className="text-lg font-black text-indigo-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}
                                        </div>
                                        <div className="text-[11px] text-gray-500 mt-1">Kho: {v.quantity} | Giảm: {v.discount}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mô tả chi tiết */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Layers size={18} className="text-indigo-500" />
                            Mô tả chi tiết
                        </h3>
                        <div className="space-y-6">
                            {product.descriptions?.map((desc, idx) => (
                                <div key={idx} className="relative pl-6 border-l-2 border-indigo-100">
                                    {desc.title && <h4 className="font-bold text-gray-800 mb-2">{desc.title}</h4>}
                                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{desc.content}</p>
                                </div>
                            ))}
                            {(!product.descriptions || product.descriptions.length === 0) && (
                                <p className="text-gray-400 italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProductDetail;