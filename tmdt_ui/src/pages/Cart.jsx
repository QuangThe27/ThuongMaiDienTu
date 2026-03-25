import React, { useEffect, useState } from 'react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCartByUserId, updateCartQuantity, deleteCart } from '../services/cartService';
import { Link } from 'react-router-dom';

function Cart() {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_PRODUCT}`;

    const fetchCart = async () => {
        if (!user) return;
        try {
            const res = await getCartByUserId(user.id);
            if (res.success) {
                setCartItems(res.data);
            }
        } catch (error) {
            console.error("Lỗi tải giỏ hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const handleUpdateQuantity = async (id, newQty, stock) => {
        if (newQty < 1) return;
        // stock bây giờ đã có giá trị từ Backend nhờ vào việc sửa Model ở trên
        if (newQty > stock) {
            alert(`Rất tiếc, kho chỉ còn ${stock} sản phẩm!`);
            return;
        }

        try {
            const res = await updateCartQuantity(id, newQty);
            if (res.success) {
                setCartItems(prev => prev.map(item => 
                    item.id === id ? { ...item, quantity: newQty } : item
                ));
            }
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi cập nhật");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
        try {
            const res = await deleteCart(id);
            if (res.success) {
                setCartItems(prev => prev.filter(item => item.id !== id));
            }
        } catch {
            alert("Lỗi khi xóa sản phẩm");
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.price) * (1 - Number(item.discount) / 100);
            return total + (price * item.quantity);
        }, 0);
    };

    if (loading) return <div className="pt-32 text-center font-bold">Đang tải giỏ hàng...</div>;

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="flex items-center space-x-4 mb-12 border-b-4 border-black pb-4">
                    <ShoppingBag size={32} />
                    <h1 className="text-4xl font-black uppercase tracking-tighter">Giỏ hàng của bạn</h1>
                    <span className="text-gray-400 font-bold text-xl">({cartItems.length})</span>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50">
                        <p className="text-xl text-gray-500 mb-6 font-medium italic">Giỏ hàng đang trống...</p>
                        <Link to="/" className="inline-block bg-black text-white px-10 py-4 font-black uppercase tracking-widest hover:bg-sky-500 transition-all">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                        <div className="xl:col-span-2 space-y-6">
                            {cartItems.map((item) => {
                                const unitPrice = Number(item.price) * (1 - Number(item.discount) / 100);
                                return (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center bg-white border border-gray-100 p-6 space-y-4 sm:space-y-0 sm:space-x-8 group hover:border-sky-200 transition-all">
                                        <div className="w-32 aspect-[3/4] overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img 
                                                src={`${CLOUDINARY_URL}/${item.image}`} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                alt={item.product_name} 
                                            />
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-black text-lg uppercase mb-1 tracking-tight">{item.product_name}</h3>
                                            <p className="text-sky-600 font-bold text-sm mb-2 uppercase">
                                                {item.variant_name}: {item.variant_value}
                                            </p>
                                            <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4">
                                                <span className="font-black text-lg">{Math.round(unitPrice).toLocaleString('vi-VN')}đ</span>
                                                {item.discount > 0 && (
                                                    <span className="text-gray-400 line-through text-sm">{Number(item.price).toLocaleString('vi-VN')}đ</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center border-2 border-black h-12">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.stock)}
                                                className="px-4 hover:bg-gray-100 transition-colors"
                                            ><Minus size={14} /></button>
                                            <span className="w-10 text-center font-black">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.stock)}
                                                className="px-4 hover:bg-gray-100 transition-colors"
                                            ><Plus size={14} /></button>
                                        </div>

                                        <div className="text-right flex flex-col items-center sm:items-end space-y-2">
                                            <p className="font-black text-xl">{Math.round(unitPrice * item.quantity).toLocaleString('vi-VN')}đ</p>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors flex items-center space-x-1"
                                            >
                                                <Trash2 size={18} />
                                                <span className="text-xs font-bold uppercase">Xóa</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="xl:col-span-1">
                            <div className="bg-gray-50 p-8 sticky top-32">
                                <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b-2 border-gray-200 pb-4">Tóm tắt đơn hàng</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between font-bold text-gray-500 uppercase text-sm">
                                        <span>Tạm tính</span>
                                        <span>{Math.round(calculateSubtotal()).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-500 uppercase text-sm">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-sky-500 font-black italic">MIỄN PHÍ</span>
                                    </div>
                                    <div className="pt-6 border-t-2 border-black flex justify-between items-baseline">
                                        <span className="text-xl font-black uppercase">Tổng cộng</span>
                                        <span className="text-3xl font-black text-sky-600">{Math.round(calculateSubtotal()).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>
                                
                                <button className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.2em] hover:bg-sky-600 transition-all flex items-center justify-center space-x-3">
                                    <span>Thanh toán ngay</span>
                                    <ArrowRight size={20} />
                                </button>

                                <div className="mt-8 space-y-3">
                                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400">
                                        <ShieldCheck size={14} /> <span>Thanh toán bảo mật 100%</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400">
                                        <Truck size={14} /> <span>Giao hàng từ 2-4 ngày làm việc</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cart;