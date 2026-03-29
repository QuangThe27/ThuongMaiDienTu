import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/orderService';
import { getCartByUserId } from '../services/cartService';
import { 
    MapPin, Phone, User, Mail, CreditCard, 
    Truck, ChevronLeft, CheckCircle2, ShieldCheck 
} from 'lucide-react';

function Checkout() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Lấy dữ liệu từ Cart truyền sang hoặc mặc định là mảng rỗng
    const [cartItems, setCartItems] = useState(location.state?.items || []);
    const [loading, setLoading] = useState(false);

    // Cloudinary URL từ biến môi trường
    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_PRODUCT}`;

    // State cho Form thông tin
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        positioning: '',
        payment_method: 0 // 0: COD, 1: Online
    });

    // Nếu người dùng F5 trang Checkout, fetch lại giỏ hàng từ API
    useEffect(() => {
        if (cartItems.length === 0 && user) {
            const fetchCart = async () => {
                try {
                    const res = await getCartByUserId(user.id);
                    if (res.success) {
                        setCartItems(res.data);
                    }
                } catch (error) {
                    console.error("Lỗi khi tải lại giỏ hàng:", error);
                }
            };
            fetchCart();
        }
    }, [user, cartItems.length]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.price) * (1 - Number(item.discount) / 100);
            return total + (price * item.quantity);
        }, 0);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        // Kiểm tra validate cơ bản
        if (!formData.phone || !formData.address) {
            alert("Vui lòng điền đầy đủ số điện thoại và địa chỉ nhận hàng!");
            return;
        }

        setLoading(true);
        try {
            const orderPayload = {
                user_id: user.id,
                name: formData.name, // Lấy từ form (mặc định của user)
                phone: formData.phone,
                address: formData.address,
                positioning: formData.positioning,
                total_price: calculateTotal(),
                ship_price: 0, // Miễn phí vận chuyển
                payment_method: formData.payment_method,
                payment_status: 0, // Mặc định chưa thanh toán
                status: 0, // Trạng thái: Đặt thành công
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    price: Number(item.price) * (1 - Number(item.discount) / 100),
                    quantity: item.quantity
                }))
            };

            const res = await createOrder(orderPayload);
            
            if (res.status === 'success') {
                alert("Chúc mừng! Đơn hàng của bạn đã được hệ thống ghi nhận.");
                // Chuyển hướng về trang danh sách đơn hàng hoặc trang chủ
                navigate('/'); 
            }
        } catch (error) {
            alert(error.response?.data?.message || "Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="pt-40 text-center">
                <p className="text-gray-400 font-bold uppercase italic mb-4">Không có sản phẩm nào để thanh toán</p>
                <Link to="/cart" className="text-sky-500 font-black border-b-2 border-sky-500">QUAY LẠI GIỎ HÀNG</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header điều hướng */}
                <div className="flex items-center justify-between mb-12 border-b-4 border-black pb-6">
                    <Link to="/cart" className="flex items-center gap-2 font-black uppercase text-sm hover:text-sky-500 transition-all">
                        <ChevronLeft size={20} /> Quay lại
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-right">
                        Xác nhận <span className="text-sky-500">Thanh toán</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* PHẦN NHẬP THÔNG TIN (8 cột trên Desktop) */}
                    <div className="lg:col-span-7 space-y-10">
                        
                        {/* 1. Thông tin liên hệ */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-black">1</div>
                                <h2 className="text-xl font-black uppercase italic">Thông tin người nhận</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Họ và tên</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            type="text" 
                                            value={formData.name} 
                                            disabled 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 font-bold text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Email tài khoản</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            type="email" 
                                            value={formData.email} 
                                            disabled 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 font-bold text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Số điện thoại nhận hàng *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Nhập số điện thoại để shipper liên lạc"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 focus:border-black outline-none transition-all font-black"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Địa chỉ giao hàng *</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                                        <textarea 
                                            rows="3"
                                            placeholder="Số nhà, tên đường, quận/huyện..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 focus:border-black outline-none transition-all font-black"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Ghi chú vị trí</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ví dụ: Đối diện quán cafe, lầu 2..."
                                        value={formData.positioning}
                                        onChange={(e) => setFormData({...formData, positioning: e.target.value})}
                                        className="w-full px-4 py-4 border-2 border-gray-100 focus:border-black outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 2. Phương thức thanh toán */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-black">2</div>
                                <h2 className="text-xl font-black uppercase italic">Hình thức thanh toán</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`flex items-center justify-between p-5 border-2 cursor-pointer transition-all ${formData.payment_method === 0 ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" checked={formData.payment_method === 0} onChange={() => setFormData({...formData, payment_method: 0})} className="w-5 h-5 accent-black" />
                                        <div>
                                            <p className="font-black text-sm uppercase">Tiền mặt (COD)</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Thanh toán khi nhận hàng</p>
                                        </div>
                                    </div>
                                    <Truck size={24} className="text-gray-300" />
                                </label>

                                <label className={`flex items-center justify-between p-5 border-2 cursor-pointer transition-all ${formData.payment_method === 1 ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className="flex items-center gap-4">
                                        <input type="radio" name="payment" checked={formData.payment_method === 1} onChange={() => setFormData({...formData, payment_method: 1})} className="w-5 h-5 accent-black" />
                                        <div>
                                            <p className="font-black text-sm uppercase">Chuyển khoản</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Thanh toán qua ngân hàng</p>
                                        </div>
                                    </div>
                                    <CreditCard size={24} className="text-gray-300" />
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* TÓM TẮT ĐƠN HÀNG (4 cột trên Desktop) */}
                    <div className="lg:col-span-5">
                        <div className="bg-gray-50 p-8 sticky top-32 border-t-8 border-sky-500 shadow-xl">
                            <h3 className="text-2xl font-black uppercase italic mb-8 border-b-2 border-gray-200 pb-4 tracking-tighter">Đơn hàng của bạn</h3>
                            
                            <div className="space-y-6 max-h-[400px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                                {cartItems.map((item) => {
                                    const finalPrice = Number(item.price) * (1 - Number(item.discount) / 100);
                                    return (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-24 bg-white p-1 border border-gray-200 flex-shrink-0 overflow-hidden">
                                                <img 
                                                    src={`${CLOUDINARY_URL}/${item.image}`} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    alt="" 
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-sm uppercase leading-tight mb-1 line-clamp-1">{item.product_name}</h4>
                                                <p className="text-[10px] font-bold text-sky-600 uppercase mb-2">
                                                    {item.variant_name}: {item.variant_value} <span className="text-gray-300 ml-1">x {item.quantity}</span>
                                                </p>
                                                <p className="font-black text-sm">{(finalPrice * item.quantity).toLocaleString('vi-VN')}đ</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4 border-t-2 border-dashed border-gray-300 pt-6">
                                <div className="flex justify-between font-bold text-gray-400 uppercase text-xs tracking-widest">
                                    <span>Tạm tính</span>
                                    <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-400 uppercase text-xs tracking-widest">
                                    <span>Vận chuyển</span>
                                    <span className="text-sky-500 italic">Miễn phí</span>
                                </div>
                                <div className="flex justify-between items-baseline pt-4 border-t-2 border-black">
                                    <span className="text-xl font-black uppercase italic">Tổng cộng</span>
                                    <span className="text-4xl font-black text-sky-600 tracking-tighter">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-black text-white py-6 mt-8 font-black uppercase tracking-[0.3em] text-lg hover:bg-sky-600 transition-all flex items-center justify-center gap-4 group disabled:bg-gray-400"
                            >
                                {loading ? "Đang xử lý..." : (
                                    <>
                                        <span>Đặt hàng ngay</span>
                                        <CheckCircle2 className="group-hover:rotate-12 transition-transform" size={24} />
                                    </>
                                )}
                            </button>

                            <div className="mt-8 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400">
                                    <ShieldCheck size={16} className="text-green-500" />
                                    <span>Bảo mật thông tin thanh toán tuyệt đối</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400">
                                    <Truck size={16} className="text-sky-500" />
                                    <span>Giao hàng hỏa tốc trong 2-4 ngày</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;