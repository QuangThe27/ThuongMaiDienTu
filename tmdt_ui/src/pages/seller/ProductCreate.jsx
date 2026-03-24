import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCategories } from '../../services/categoryService';
import { getStoreByUserId } from '../../services/storeService';
import { createProduct } from '../../services/productService';
import SellerHeader from '../../components/SellerHeader';
import Notification from '../../components/Notification';
import { Plus, Trash2, Image as ImageIcon, Package, ListTree, Info, Settings, Store } from 'lucide-react';

function ProductCreate() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [storeId, setStoreId] = useState('');
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState(1);
    const [images, setImages] = useState([]); // File objects
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [descriptions, setDescriptions] = useState([{ title: '', content: '' }]);
    const [variants, setVariants] = useState([{ variant_name: '', variant_value: '', price: '', quantity: '', discount: 0, level: 1 }]);

    useEffect(() => {
        const initData = async () => {
            try {
                // Gọi API lấy thông tin cửa hàng và danh mục cùng lúc
                const [storeRes, catRes] = await Promise.all([
                    getStoreByUserId(user.id),
                    getCategories()
                ]);

                // Xử lý Store ID (Lưu ý: kiểm tra cấu trúc response của bạn là .data hay .data.data)
                if (storeRes && storeRes.data) {
                    setStoreId(storeRes.data.id);
                }

                // Xử lý Categories
                if (catRes && catRes.data) {
                    setCategories(catRes.data);
                }
            } catch (err) {
                console.error("Init Error:", err);
                setNotification({ message: "Không thể tải thông tin hệ thống. Vui lòng thử lại!", type: 'error' });
            }
        };

        if (user?.id) {
            initData();
        }
    }, [user]);

    // Handlers
    const addField = (type) => {
        if (type === 'desc') setDescriptions([...descriptions, { title: '', content: '' }]);
        if (type === 'variant') setVariants([...variants, { variant_name: '', variant_value: '', price: '', quantity: '', discount: 0, level: variants.length + 1 }]);
    };

    const removeField = (type, index) => {
        if (type === 'desc') setDescriptions(descriptions.filter((_, i) => i !== index));
        if (type === 'variant') setVariants(variants.filter((_, i) => i !== index));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages([...images, ...files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!storeId) {
            setNotification({ message: 'Không tìm thấy ID cửa hàng!', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category_id', categoryId);
            formData.append('store_id', storeId);
            formData.append('status', status);
            formData.append('mainImageIndex', mainImageIndex);
            formData.append('descriptions', JSON.stringify(descriptions));
            formData.append('variants', JSON.stringify(variants));
            
            if (images.length === 0) {
                setNotification({ message: 'Vui lòng chọn ít nhất 1 hình ảnh!', type: 'error' });
                return;
            }

            images.forEach((img) => {
                formData.append('images', img); 
            });

            await createProduct(formData);
            setNotification({ message: 'Tạo sản phẩm thành công!', type: 'success' });
            setTimeout(() => navigate('/seller/san-pham'), 1500);
        } catch (err) {
            setNotification({ message: err.response?.data?.message || 'Lỗi khi tạo sản phẩm', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            <SellerHeader title="Thêm Sản Phẩm Mới" subTitle="Thiết lập thông tin sản phẩm và kho hàng" />

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* SECTION 1: CƠ BẢN */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Package size={20}/></div>
                        <h3 className="font-black text-gray-800 uppercase tracking-tight">Thông tin cơ bản</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Store ID (Read-only) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Mã cửa hàng (ID)</label>
                            <div className="relative">
                                <input 
                                    readOnly 
                                    value={storeId || 'Đang tải...'} 
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-100 border-none font-bold text-gray-500 cursor-not-allowed" 
                                />
                                <Store size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Tên sản phẩm</label>
                            <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-200 transition-all font-medium" placeholder="Ví dụ: Giày Sneaker Thể Thao" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Danh mục</label>
                            <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-orange-200 transition-all font-medium">
                                <option value="">Chọn danh mục</option>
                                {categories && categories.length > 0 && categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: HÌNH ẢNH */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ImageIcon size={20}/></div>
                        <h3 className="font-black text-gray-800 uppercase tracking-tight">Hình ảnh sản phẩm</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {images.map((img, index) => (
                            <div key={index} className={`relative group aspect-square rounded-3xl overflow-hidden border-2 ${mainImageIndex === index ? 'border-orange-500' : 'border-transparent'}`}>
                                <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="product" />
                                <button type="button" onClick={() => setMainImageIndex(index)} className={`absolute bottom-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold ${mainImageIndex === index ? 'bg-orange-500 text-white' : 'bg-black/50 text-white'}`}>
                                    {mainImageIndex === index ? 'ẢNH CHÍNH' : 'LÀM ẢNH CHÍNH'}
                                </button>
                                <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                            <Plus className="text-gray-300 mb-2" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Tải ảnh lên</span>
                            <input type="file" multiple hidden onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                </section>

                {/* SECTION 3: MÔ TẢ */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><Info size={20}/></div>
                            <h3 className="font-black text-gray-800 uppercase tracking-tight">Mô tả chi tiết</h3>
                        </div>
                        <button type="button" onClick={() => addField('desc')} className="p-2 bg-gray-50 text-gray-400 hover:text-green-600 rounded-xl transition-colors"><Plus/></button>
                    </div>
                    <div className="space-y-4">
                        {descriptions.map((desc, index) => (
                            <div key={index} className="p-6 bg-gray-50/50 rounded-3xl relative">
                                <input placeholder="Tiêu đề đoạn (Không bắt buộc)" value={desc.title} onChange={e => {
                                    const newDesc = [...descriptions];
                                    newDesc[index].title = e.target.value;
                                    setDescriptions(newDesc);
                                }} className="w-full mb-3 bg-transparent border-b border-gray-200 py-2 font-bold focus:outline-none focus:border-green-500" />
                                <textarea required placeholder="Nội dung mô tả..." rows="3" value={desc.content} onChange={e => {
                                    const newDesc = [...descriptions];
                                    newDesc[index].content = e.target.value;
                                    setDescriptions(newDesc);
                                }} className="w-full bg-transparent focus:outline-none" />
                                {descriptions.length > 1 && (
                                    <button type="button" onClick={() => removeField('desc', index)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 4: BIẾN THỂ */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Settings size={20}/></div>
                            <h3 className="font-black text-gray-800 uppercase tracking-tight">Phân loại & Giá</h3>
                        </div>
                        <button type="button" onClick={() => addField('variant')} className="p-2 bg-gray-50 text-gray-400 hover:text-purple-600 rounded-xl transition-colors"><Plus/></button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                    <th className="pb-4">Loại (Màu/Size)</th>
                                    <th className="pb-4">Giá trị (Đỏ/XL)</th>
                                    <th className="pb-4">Giá bán (đ)</th>
                                    <th className="pb-4">Kho</th>
                                    <th className="pb-4">Giảm %</th>
                                    <th className="pb-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {variants.map((v, i) => (
                                    <tr key={i}>
                                        <td className="py-4 pr-2"><input required placeholder="Size" value={v.variant_name} onChange={e => {const n = [...variants]; n[i].variant_name = e.target.value; setVariants(n)}} className="w-full bg-gray-50 p-3 rounded-xl text-sm border-none focus:ring-1 focus:ring-purple-200" /></td>
                                        <td className="py-4 pr-2"><input required placeholder="XL" value={v.variant_value} onChange={e => {const n = [...variants]; n[i].variant_value = e.target.value; setVariants(n)}} className="w-full bg-gray-50 p-3 rounded-xl text-sm border-none focus:ring-1 focus:ring-purple-200" /></td>
                                        <td className="py-4 pr-2"><input required type="number" placeholder="0" value={v.price} onChange={e => {const n = [...variants]; n[i].price = e.target.value; setVariants(n)}} className="w-full bg-gray-50 p-3 rounded-xl text-sm border-none focus:ring-1 focus:ring-purple-200" /></td>
                                        <td className="py-4 pr-2"><input required type="number" placeholder="0" value={v.quantity} onChange={e => {const n = [...variants]; n[i].quantity = e.target.value; setVariants(n)}} className="w-full bg-gray-50 p-3 rounded-xl text-sm border-none focus:ring-1 focus:ring-purple-200" /></td>
                                        <td className="py-4 pr-2"><input type="number" placeholder="0" value={v.discount} onChange={e => {const n = [...variants]; n[i].discount = e.target.value; setVariants(n)}} className="w-full bg-gray-50 p-3 rounded-xl text-sm border-none focus:ring-1 focus:ring-purple-200" /></td>
                                        <td className="py-4 text-right">
                                            {variants.length > 1 && <button type="button" onClick={() => removeField('variant', i)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* NÚT SUBMIT */}
                <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={status === 1} onChange={e => setStatus(e.target.checked ? 1 : 0)} className="w-5 h-5 rounded-lg text-orange-500 focus:ring-orange-200 border-gray-200" />
                            <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">Kích hoạt bán ngay</span>
                        </label>
                    </div>
                    <button type="submit" disabled={loading} className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50">
                        {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductCreate;