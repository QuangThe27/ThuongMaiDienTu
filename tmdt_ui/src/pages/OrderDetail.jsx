import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { getProductById } from '../services/productService';
import { createReview } from '../services/reviewService';
// Import socket instance của bạn
import socket from '../socket';
import {
    ChevronLeft,
    Package,
    MapPin,
    Phone,
    CreditCard,
    Calendar,
    Hash,
    Truck,
    X,
    Star,
    Camera,
    UploadCloud,
    Loader2,
    MessageSquare,
    QrCode,
} from 'lucide-react';

function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [itemImages, setItemImages] = useState({});

    // States cho Modal Đánh giá
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${
        import.meta.env.VITE_CLOUDINARY_PRODUCT
    }`;

    // 1. Lấy dữ liệu lần đầu
    useEffect(() => {
        fetchDetail();
    }, [id]);

    // 2. Logic Socket Realtime
    useEffect(() => {
        if (order && order.user_id) {
            // Join vào room cá nhân để nhận thông báo thanh toán
            socket.emit('join_user_room', order.user_id);

            // Lắng nghe sự kiện thanh toán thành công
            const handlePaymentSuccess = (data) => {
                // Kiểm tra nếu đúng ID đơn hàng hiện tại thì cập nhật
                if (parseInt(data.orderId) === parseInt(id)) {
                    console.log('Phát hiện thanh toán thành công qua Socket!');
                    fetchDetail(); // Gọi lại API để cập nhật UI tự động
                }
            };

            socket.on('order_payment_success', handlePaymentSuccess);

            // Cleanup khi unmount
            return () => {
                socket.off('order_payment_success', handlePaymentSuccess);
            };
        }
    }, [order?.user_id, id]);

    const fetchDetail = async () => {
        try {
            const res = await getOrderById(id);
            if (res.status === 'success') {
                setOrder(res.data);
                fetchProductImages(res.data.items);
            }
        } catch (error) {
            console.error('Lỗi:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductImages = async (items) => {
        const imagesMap = {};
        for (const item of items) {
            if (item.product_id && !imagesMap[item.product_id]) {
                try {
                    const res = await getProductById(item.product_id);
                    if (res.success) {
                        const mainImg = res.data.images.find((img) => img.isMain === 1);
                        imagesMap[item.product_id] = mainImg
                            ? mainImg.image
                            : res.data.images[0]?.image;
                    }
                } catch (err) {
                    console.error('Lỗi lấy ảnh SP:', err);
                }
            }
        }
        setItemImages(imagesMap);
    };

    const openReviewModal = (item) => {
        setSelectedItem(item);
        setRating(5);
        setComment('');
        setImages([]);
        setShowReviewModal(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            alert('Bạn chỉ được chọn tối đa 3 hình ảnh.');
            return;
        }
        setImages([...images, ...files]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async () => {
        if (!comment.trim()) {
            alert('Vui lòng nhập cảm nhận của bạn.');
            return;
        }
        const formData = new FormData();
        formData.append('user_id', order.user_id);
        formData.append('product_id', selectedItem.product_id);
        formData.append('orderItem_id', selectedItem.id);
        formData.append('point', rating);
        formData.append('content', comment);
        images.forEach((file) => {
            formData.append('images', file);
        });

        setSubmitting(true);
        try {
            const res = await createReview(formData);
            alert(res.message || 'Cảm ơn bạn đã đánh giá sản phẩm!');
            setShowReviewModal(false);
            fetchDetail();
        } catch (error) {
            console.error('Lỗi gửi review:', error);
            alert(error.response?.data?.message || 'Gửi đánh giá thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusLabel = (status) => {
        const s = {
            0: 'Đặt thành công',
            1: 'Đang chuẩn bị',
            2: 'Đang giao hàng',
            3: 'Giao thành công',
        };
        return s[status] || 'Không xác định';
    };

    const generateVietQR = () => {
        const BANK_ID = 'mbbank';
        const ACCOUNT_NO = '86666270103';
        const TEMPLATE = 'compact2';
        const AMOUNT = Math.round(order.total_price);
        const DESCRIPTION = `tmdt${order.id}`;
        return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${AMOUNT}&addInfo=${DESCRIPTION}&accountName=NGUYEN%20THE%20QUANG`;
    };

    if (loading)
        return (
            <div className="pt-40 text-center font-black uppercase animate-pulse">
                ĐANG TẢI CHI TIẾT...
            </div>
        );
    if (!order) return <div className="pt-40 text-center">Không tìm thấy đơn hàng.</div>;

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link
                    to="/lich-su-don-hang"
                    className="inline-flex items-center gap-2 font-black uppercase text-xs mb-8 hover:text-sky-500 transition-all"
                >
                    <ChevronLeft size={16} /> Quay lại lịch sử
                </Link>

                {/* Header đơn hàng */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-4 border-black pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Hash className="text-sky-500" size={24} />
                            <h1 className="text-3xl font-black uppercase tracking-tighter">
                                Đơn hàng #{order.id}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />{' '}
                                {new Date(order.created_at).toLocaleString('vi-VN')}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-sky-500 text-white px-4 py-3 font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            {getStatusLabel(order.status)}
                        </div>

                        {order.payment_method === 1 && (
                            <div
                                className={`${
                                    order.payment_status === 1 ? 'bg-green-500' : 'bg-red-500'
                                } text-white px-4 py-3 font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                            >
                                {order.payment_status === 1 ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="p-6 bg-gray-50 border-2 border-gray-100">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                            <MapPin size={14} /> Địa chỉ nhận hàng
                        </p>
                        <p className="font-black uppercase text-sm mb-1">{order.name}</p>
                        <p className="text-sm font-bold mb-2 flex items-center gap-1">
                            <Phone size={12} /> {order.phone}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">{order.address}</p>
                    </div>

                    <div className="p-6 bg-gray-50 border-2 border-gray-100">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                            <CreditCard size={14} /> Thanh toán
                        </p>
                        <p className="font-black uppercase text-sm">
                            {order.payment_method === 0 ? 'Tiền mặt (COD)' : 'Chuyển khoản Online'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Phí vận chuyển: {Number(order.ship_price).toLocaleString('vi-VN')}đ
                        </p>
                    </div>

                    <div className="p-6 bg-black text-white">
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-4 italic">
                            Tổng thanh toán
                        </p>
                        <p className="text-3xl font-black tracking-tighter text-sky-400">
                            {Number(order.total_price).toLocaleString('vi-VN')}đ
                        </p>
                        <p className="text-[10px] font-bold mt-2 uppercase text-gray-500 tracking-widest">
                            Đã bao gồm VAT
                        </p>
                    </div>
                </div>

                {/* QR THANH TOÁN (Chỉ hiện khi Online và Chưa thanh toán) */}
                {order.payment_method === 1 && order.payment_status === 0 && (
                    <div className="mb-12 p-8 border-4 border-dashed border-sky-200 bg-sky-50/30 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-6">
                            <QrCode size={24} className="text-sky-600" />
                            <h3 className="text-xl font-black uppercase italic text-sky-900">
                                Quét mã để thanh toán
                            </h3>
                        </div>
                        <div className="bg-white p-4 rounded-3xl shadow-xl border-2 border-sky-100 mb-6">
                            <img
                                src={generateVietQR()}
                                alt="VietQR Payment"
                                className="w-64 h-64 object-contain"
                            />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-black uppercase">Nguyễn Thế Quang</p>
                            <p className="text-xs font-bold text-gray-500">
                                MB Bank: <span className="text-black">86666270103</span>
                            </p>
                            <p className="text-[10px] font-bold text-sky-600 bg-white px-4 py-1 rounded-full border border-sky-100 mt-2">
                                Nội dung: tmdt{order.id}
                            </p>
                        </div>
                    </div>
                )}

                {/* Danh sách sản phẩm */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2">
                        <Package size={20} /> Sản phẩm đã mua
                    </h3>

                    {order.items.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-center gap-6 p-4 border-2 border-gray-100 hover:border-black transition-all group"
                        >
                            <div className="w-20 h-24 bg-gray-100 overflow-hidden flex-shrink-0">
                                <img
                                    src={
                                        itemImages[item.product_id]
                                            ? `${CLOUDINARY_URL}/${itemImages[item.product_id]}`
                                            : 'https://via.placeholder.com/150'
                                    }
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt=""
                                />
                            </div>

                            <div className="flex-1">
                                <h4 className="font-black text-sm uppercase mb-1">
                                    {item.product_name}
                                </h4>
                                <p className="text-[10px] font-bold text-sky-600 uppercase">
                                    Phân loại: {item.variant_name} - {item.variant_value}
                                </p>
                                <p className="text-xs font-bold text-gray-400 mt-1 italic">
                                    Số lượng: {item.quantity}
                                </p>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
                                <div className="text-right">
                                    <p className="font-black text-lg">
                                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                    </p>
                                </div>

                                {item.isReview === 0 ? (
                                    <button
                                        onClick={() => openReviewModal(item)}
                                        className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-black transition-all"
                                    >
                                        <MessageSquare size={14} /> Viết đánh giá
                                    </button>
                                ) : (
                                    <span className="text-[10px] font-black uppercase text-green-500 bg-green-50 px-3 py-1">
                                        Đã đánh giá
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* MODAL ĐÁNH GIÁ */}
                {showReviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-black text-gray-800 italic uppercase">
                                    Đánh giá sản phẩm
                                </h3>
                                <p className="text-xs text-sky-500 font-black uppercase mt-1 tracking-tighter leading-tight">
                                    {selectedItem?.product_name}
                                </p>
                            </div>
                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setRating(s)}
                                        className="focus:outline-none transition-transform active:scale-90"
                                    >
                                        <Star
                                            size={36}
                                            className={`${
                                                s <= rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-200'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="mb-6">
                                <div className="flex justify-between items-center px-4 mb-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                                        Cảm nhận
                                    </label>
                                    <span
                                        className={`text-[10px] font-black ${
                                            comment.length >= 150 ? 'text-red-500' : 'text-gray-400'
                                        }`}
                                    >
                                        {comment.length} / 150
                                    </span>
                                </div>
                                <textarea
                                    className={`w-full p-4 bg-gray-50 rounded-2xl border outline-none min-h-[120px] text-sm font-medium ${
                                        comment.length >= 150 ? 'border-red-400' : 'border-gray-100'
                                    }`}
                                    placeholder="Sản phẩm rất tuyệt vời..."
                                    value={comment}
                                    maxLength={150}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                            <div className="mb-8">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                                    Hình ảnh (Tối đa 3)
                                </label>
                                <div className="flex flex-wrap gap-3 ml-2">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative w-20 h-20">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                className="w-full h-full rounded-2xl object-cover border-2 border-blue-50"
                                                alt=""
                                            />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 3 && (
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 text-gray-400">
                                            <Camera size={24} />
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                multiple
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            <button
                                disabled={submitting}
                                onClick={handleSubmitReview}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 transition-all uppercase tracking-widest italic"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <UploadCloud size={20} /> Gửi đánh giá ngay
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderDetail;
