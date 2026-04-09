import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Heart,
    Truck,
    RotateCcw,
    Minus,
    Plus,
    Check,
    Star,
    User,
    ChevronDown,
} from 'lucide-react';
import { getProductById } from '../services/productService';
import { createCart } from '../services/cartService';
import { useAuth } from '../contexts/AuthContext';
import { getReviewsByProductId } from '../services/reviewService';
import { getStoreById } from '../services/storeService';
import ChatBox from '../components/ChatBox';
import { useNotification } from '../contexts/NotificationContext';

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
    const { showNotification } = useNotification();

    // Review States
    const [reviews, setReviews] = useState([]);
    const [filterStar, setFilterStar] = useState(0); // 0 = Tất cả
    const [visibleCount, setVisibleCount] = useState(10);

    const [store, setStore] = useState(null);

    const CLOUDINARY_PRODUCT = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${
        import.meta.env.VITE_CLOUDINARY_PRODUCT
    }`;
    const CLOUDINARY_USER = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${
        import.meta.env.VITE_CLOUDINARY_AVATAR
    }`;
    const CLOUDINARY_REVIEW = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${
        import.meta.env.VITE_CLOUDINARY_REVIEW
    }`;
    const CLOUDINARY_STORE = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${
        import.meta.env.VITE_CLOUDINARY_STORE
    }`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, reviewRes] = await Promise.all([
                    getProductById(id),
                    getReviewsByProductId(id),
                ]);

                if (productRes.success) {
                    const data = productRes.data;
                    setProduct(data);
                    const mainImg = data.images?.find((img) => img.isMain === 1)?.image;
                    setMainImage(mainImg || data.images?.[0]?.image);

                    if (data.variants && data.variants.length > 0) {
                        const lowestLevelVariant = [...data.variants].sort(
                            (a, b) => a.level - b.level
                        )[0];
                        setSelectedVariant(lowestLevelVariant);
                    }

                    const storeRes = await getStoreById(data.store_id);
                    if (storeRes) setStore(storeRes.data);
                }

                if (reviewRes.success) {
                    setReviews(reviewRes.data);
                }
            } catch (error) {
                console.error('Lỗi lấy dữ liệu:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Logic tính toán Review
    const stats = useMemo(() => {
        if (reviews.length === 0) return { avg: 0, total: 0, counts: [0, 0, 0, 0, 0, 0] };
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.point, 0);
        const counts = [0, 0, 0, 0, 0, 0];
        reviews.forEach((r) => counts[r.point]++);
        return { avg: (sum / total).toFixed(1), total, counts };
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        return filterStar === 0 ? reviews : reviews.filter((r) => r.point === filterStar);
    }, [reviews, filterStar]);

    const handleAddToCart = async () => {
        // 1. Kiểm tra đăng nhập
        if (!isLoggedIn) {
            showNotification('Vui lòng đăng nhập để mua hàng!', 'error');
            return navigate('/login');
        }

        // 2. Kiểm tra biến thể
        if (!selectedVariant) {
            return showNotification('Vui lòng chọn phiên bản sản phẩm!', 'error');
        }

        // 3. Kiểm tra tồn kho
        if (quantity > selectedVariant.quantity) {
            return showNotification('Số lượng vượt quá tồn kho hiện có!', 'error');
        }

        setIsAdding(true);
        try {
            const res = await createCart({
                user_id: user.id,
                product_id: product.id,
                variant_id: selectedVariant.id,
                quantity: quantity,
            });

            if (res.success) {
                // THAY ĐỔI Ở ĐÂY: Không navigate nữa mà hiện thông báo thành công
                showNotification('Đã thêm sản phẩm vào giỏ hàng thành công!', 'success');

                // Tùy chọn: Reset số lượng về 1 sau khi thêm thành công
                setQuantity(1);
            }
        } catch (error) {
            showNotification(error.response?.data?.message || 'Lỗi kết nối hệ thống', 'error');
        } finally {
            setIsAdding(false);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center font-bold text-sky-500 italic uppercase tracking-widest">
                ĐANG TẢI...
            </div>
        );
    if (!product)
        return (
            <div className="min-h-screen flex items-center justify-center font-bold text-red-500">
                SẢN PHẨM KHÔNG TỒN TẠI
            </div>
        );

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
                                src={`${CLOUDINARY_PRODUCT}/${mainImage}`}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            {product.images?.map((img) => (
                                <div
                                    key={img.id}
                                    onClick={() => setMainImage(img.image)}
                                    className={`aspect-square cursor-pointer border-2 transition-all p-1 ${
                                        mainImage === img.image
                                            ? 'border-sky-500'
                                            : 'border-transparent hover:border-gray-200'
                                    }`}
                                >
                                    <img
                                        src={`${CLOUDINARY_PRODUCT}/${img.image}`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* THÔNG TIN */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2 leading-none">
                                {product.name}
                            </h1>
                            <div className="flex items-center space-x-4 mb-2">
                                <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={
                                                i < Math.round(stats.avg) ? 'currentColor' : 'none'
                                            }
                                        />
                                    ))}
                                    <span className="ml-2 text-sm font-bold text-gray-600">
                                        {stats.avg} ({stats.total} đánh giá)
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                Mã SP: {product.id} | Danh mục: {product.category_id}
                            </p>
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
                        </div>

                        <div className="mb-8">
                            <h4 className="font-black text-[10px] uppercase mb-4 tracking-[0.2em] text-gray-400">
                                Chọn phiên bản sản phẩm:
                            </h4>
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
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold uppercase text-sm">
                                                {v.variant_name}: {v.variant_value}
                                            </span>
                                            {selectedVariant?.id === v.id && (
                                                <Check size={16} className="text-sky-400" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase">
                                            {v.quantity > 0 ? `Kho: ${v.quantity}` : 'Hết hàng'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-stretch space-x-4 mb-10 h-14">
                            <div className="flex items-center border-2 border-gray-200">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="px-4 h-full hover:bg-gray-100"
                                >
                                    <Minus size={14} />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) {
                                            setQuantity(Math.max(1, val)); // Đảm bảo không nhỏ hơn 1
                                        } else {
                                            setQuantity(''); // Cho phép xóa trống tạm thời để nhập số mới
                                        }
                                    }}
                                    onBlur={() => {
                                        if (quantity === '' || quantity < 1) {
                                            setQuantity(1); // Reset về 1 nếu để trống hoặc nhập số lỗi khi rời chuột
                                        }
                                    }}
                                    className="w-12 text-center font-black text-lg focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="px-4 h-full hover:bg-gray-100"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={
                                    isAdding || !selectedVariant || selectedVariant.quantity === 0
                                }
                                className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-300 text-white font-black uppercase tracking-tight transition-all flex items-center justify-center space-x-3 shadow-lg shadow-sky-100 active:scale-95"
                            >
                                <ShoppingCart size={20} />
                                <span>{isAdding ? 'Đang xử lý...' : 'Thêm vào giỏ hàng'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {store && (
                    <div className="mt-24 bg-gray-50 border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 group">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                                <img
                                    src={`${CLOUDINARY_STORE}/${store.logo}`}
                                    className="w-full h-full object-cover"
                                    alt={store.store_name}
                                />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 group-hover:text-sky-600 transition-colors">
                                    {store.store_name}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium line-clamp-1 max-w-md">
                                    {store.description}
                                </p>
                                <div className="flex gap-4 mt-2">
                                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 uppercase">
                                        Đang hoạt động
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/cua-hang/${store.id}`)}
                            className="w-full md:w-auto px-8 py-4 bg-black text-white font-black uppercase text-xs tracking-widest hover:bg-sky-500 transition-all active:scale-95 shadow-lg"
                        >
                            Xem cửa hàng
                        </button>
                    </div>
                )}

                {/* MÔ TẢ (Giữ nguyên) */}
                <div className="mt-24">
                    <div className="inline-block border-b-4 border-black pb-2 mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">
                            Thông số & Chi tiết
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {product.descriptions?.map((desc) => (
                            <div
                                key={desc.id}
                                className="group border border-gray-100 p-8 hover:border-sky-500 transition-all"
                            >
                                <h3 className="text-xl font-black mb-4 text-gray-900 group-hover:text-sky-500 uppercase tracking-tight">
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

                {/* PHẦN ĐÁNH GIÁ (MỚI XÂY DỰNG) */}
                <div className="mt-32">
                    <div className="inline-block border-b-4 border-black pb-2 mb-12">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">
                            Khách hàng nói gì?
                        </h2>
                    </div>

                    {/* Tổng quan & Bộ lọc */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16 bg-gray-50 p-10 border border-gray-100">
                        <div className="text-center lg:border-r border-gray-200">
                            <p className="text-6xl font-black text-gray-900 mb-2">{stats.avg}</p>
                            <div className="flex justify-center text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={24}
                                        fill={i < Math.round(stats.avg) ? 'currentColor' : 'none'}
                                    />
                                ))}
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {stats.total} lượt đánh giá
                            </p>
                        </div>

                        <div className="lg:col-span-2 flex flex-wrap gap-3 items-center justify-center lg:justify-start">
                            <button
                                onClick={() => setFilterStar(0)}
                                className={`px-6 py-2 rounded-full font-bold text-xs uppercase transition-all ${
                                    filterStar === 0
                                        ? 'bg-black text-white'
                                        : 'bg-white border border-gray-200 hover:border-black'
                                }`}
                            >
                                Tất cả
                            </button>
                            {[5, 4, 3, 2, 1].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStar(s)}
                                    className={`px-6 py-2 rounded-full font-bold text-xs uppercase flex items-center space-x-2 transition-all ${
                                        filterStar === s
                                            ? 'bg-sky-500 text-white'
                                            : 'bg-white border border-gray-200 hover:border-sky-500'
                                    }`}
                                >
                                    <span>{s}</span> <Star size={12} fill="currentColor" />
                                    <span className="text-[10px] opacity-60">
                                        ({stats.counts[s]})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Danh sách review */}
                    <div className="space-y-12">
                        {filteredReviews.length > 0 ? (
                            filteredReviews.slice(0, visibleCount).map((rev) => (
                                <div
                                    key={rev.id}
                                    className="flex flex-col md:flex-row gap-6 pb-12 border-b border-gray-100 last:border-0"
                                >
                                    {/* User Info */}
                                    <div className="w-full md:w-48 shrink-0">
                                        <div className="flex items-center space-x-4 md:flex-col md:items-start md:space-x-0">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gray-100 mb-3">
                                                <img
                                                    src={
                                                        rev.user_avatar
                                                            ? `${CLOUDINARY_USER}/${rev.user_avatar}`
                                                            : '/default-avatar.png'
                                                    }
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm uppercase tracking-tight text-gray-900">
                                                    {rev.user_name}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                    {new Date(rev.timestamp).toLocaleDateString(
                                                        'vi-VN'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex text-yellow-400 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    fill={i < rev.point ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 leading-relaxed mb-6 font-medium italic">
                                            "{rev.content}"
                                        </p>

                                        {/* Review Images */}
                                        {rev.review_images.length > 0 && (
                                            <div className="flex flex-wrap gap-3">
                                                {rev.review_images.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-24 h-24 border border-gray-100 p-1 hover:border-sky-500 transition-all cursor-zoom-in"
                                                    >
                                                        <img
                                                            src={`${CLOUDINARY_REVIEW}/${img}`}
                                                            className="w-full h-full object-cover"
                                                            alt="review"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 border-2 border-dashed border-gray-200">
                                <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">
                                    Chưa có đánh giá nào phù hợp
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Load More */}
                    {filteredReviews.length > visibleCount && (
                        <div className="mt-16 text-center">
                            <button
                                onClick={() => setVisibleCount((prev) => prev + 10)}
                                className="inline-flex items-center space-x-3 px-10 py-4 bg-black text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-600 transition-all active:scale-95"
                            >
                                <span>Xem thêm đánh giá</span>
                                <ChevronDown size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* PHẦN CHAT BOX MỚI THÊM VÀO */}
                {isLoggedIn && store && (
                    <ChatBox
                        userId={user.id}
                        storeId={store.id}
                        storeName={store.store_name}
                        storeLogo={`${CLOUDINARY_STORE}/${store.logo}`}
                    />
                )}
            </div>
        </div>
    );
}

export default ProductDetail;
