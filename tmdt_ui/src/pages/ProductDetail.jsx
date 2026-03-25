import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Truck, RotateCcw, Minus, Plus, Check } from 'lucide-react';
import { getProductById } from '../services/productService';
import { createCart } from '../services/cartService'; 
import { useAuth } from '../contexts/AuthContext'; 

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth(); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_PRODUCT}`;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await getProductById(id);
                if (res.success) {
                    const data = res.data;
                    setProduct(data);
                    const mainImg = data.images?.find(img => img.isMain === 1)?.image;
                    setMainImage(mainImg || data.images?.[0]?.image);

                    if (data.variants && data.variants.length > 0) {
                        const lowestLevelVariant = [...data.variants].sort((a, b) => a.level - b.level)[0];
                        setSelectedVariant(lowestLevelVariant);
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để mua hàng!");
            return navigate('/login');
        }

        if (!selectedVariant) {
            return alert("Vui lòng chọn phiên bản sản phẩm!");
        }

        if (quantity > selectedVariant.quantity) {
            return alert("Số lượng vượt quá tồn kho!");
        }

        setIsAdding(true);
        try {
            const cartData = {
                user_id: user.id,
                product_id: product.id,
                variant_id: selectedVariant.id,
                quantity: quantity
            };
            
            const res = await createCart(cartData);
            if (res.success) {
                navigate('/gio-hang');
            } else {
                alert(res.message || "Thêm vào giỏ hàng thất bại");
            }
        } catch (error) {
            console.error("Lỗi giỏ hàng:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi kết nối server");
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-sky-500 italic uppercase tracking-widest">ĐANG TẢI...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">SẢN PHẨM KHÔNG TỒN TẠI</div>;

    const finalPrice = selectedVariant 
        ? Number(selectedVariant.price) * (1 - Number(selectedVariant.discount) / 100)
        : 0;

    return (
        <div className="bg-white min-h-screen pb-20 pt-28">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* HÌNH ẢNH */}
                    <div className="space-y-6">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                            <img 
                                src={`${CLOUDINARY_URL}/${mainImage}`} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            {product.images?.map((img) => (
                                <div 
                                    key={img.id}
                                    onClick={() => setMainImage(img.image)}
                                    className={`aspect-square cursor-pointer border-2 transition-all p-1 ${mainImage === img.image ? 'border-sky-500' : 'border-transparent hover:border-gray-200'}`}
                                >
                                    <img src={`${CLOUDINARY_URL}/${img.image}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* THÔNG TIN */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2 leading-none">{product.name}</h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Mã SP: {product.id} | Danh mục: {product.category_id}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-6 mb-8 border-l-4 border-sky-500">
                            <div className="flex items-baseline space-x-3">
                                <span className="text-4xl font-black text-sky-600">
                                    {Math.round(finalPrice).toLocaleString('vi-VN')}đ
                                </span>
                                {selectedVariant?.discount > 0 && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {Number(selectedVariant.price).toLocaleString('vi-VN')}đ
                                    </span>
                                )}
                            </div>
                            {selectedVariant?.discount > 0 && (
                                <div className="mt-1 text-red-500 font-bold text-xs uppercase tracking-tight">
                                    Tiết kiệm {selectedVariant.discount}% ngay hôm nay
                                </div>
                            )}
                        </div>

                        <div className="mb-8">
                            <h4 className="font-black text-[10px] uppercase mb-4 tracking-[0.2em] text-gray-400">Chọn phiên bản sản phẩm:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {product.variants?.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => {
                                            setSelectedVariant(v);
                                            setQuantity(1);
                                        }}
                                        disabled={v.quantity === 0}
                                        className={`relative flex flex-col p-4 border-2 transition-all text-left ${
                                            selectedVariant?.id === v.id 
                                            ? 'border-black bg-black text-white' 
                                            : v.quantity === 0 
                                              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                              : 'border-gray-100 hover:border-gray-300 bg-white text-gray-800'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold uppercase text-sm">{v.variant_name}: {v.variant_value}</span>
                                            {selectedVariant?.id === v.id && <Check size={16} className="text-sky-400" />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${selectedVariant?.id === v.id ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {v.quantity > 0 ? `Kho: ${v.quantity} sản phẩm` : 'Hết hàng'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-stretch space-x-4 mb-10 h-14">
                            <div className="flex items-center border-2 border-gray-200">
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="px-4 h-full hover:bg-gray-100 transition-colors"
                                ><Minus size={14} /></button>
                                <span className="w-10 text-center font-black text-lg">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="px-4 h-full hover:bg-gray-100 transition-colors"
                                ><Plus size={14} /></button>
                            </div>
                            <button 
                                onClick={handleAddToCart}
                                disabled={isAdding || !selectedVariant || selectedVariant.quantity === 0}
                                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-black uppercase tracking-tight transition-all flex items-center justify-center space-x-3 shadow-lg shadow-sky-100 active:scale-95"
                            >
                                <ShoppingCart size={20} />
                                <span>{isAdding ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}</span>
                            </button>
                            <button className="px-5 border-2 border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all group">
                                <Heart size={20} className="group-hover:text-red-500 group-hover:fill-red-500 transition-all" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 py-8 border-t border-gray-100">
                            <div className="flex items-center space-x-4">
                                <div className="bg-sky-50 p-3 text-sky-600"><Truck size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase">Giao hàng siêu tốc</p>
                                    <p className="text-[11px] text-gray-500">Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="bg-sky-50 p-3 text-sky-600"><RotateCcw size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase">Đổi trả dễ dàng</p>
                                    <p className="text-[11px] text-gray-500">7 ngày đổi trả nếu có lỗi từ nhà sản xuất</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MÔ TẢ */}
                <div className="mt-24">
                    <div className="inline-block border-b-4 border-black pb-2 mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Thông số & Chi tiết</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {product.descriptions?.map((desc) => (
                            <div key={desc.id} className="group border border-gray-100 p-8 hover:border-sky-500 transition-all duration-300">
                                <h3 className="text-xl font-black mb-4 text-gray-900 group-hover:text-sky-500 transition-colors uppercase tracking-tight">
                                    {desc.title}
                                </h3>
                                <div className="w-10 h-1 bg-gray-200 mb-4 group-hover:w-20 group-hover:bg-sky-500 transition-all"></div>
                                <p className="text-gray-600 leading-relaxed text-sm font-medium">
                                    {desc.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;