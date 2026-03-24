import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { Plus, Trash2, Image as ImageIcon, Package, Info, Settings, Save, ArrowLeft } from 'lucide-react';
import Notification from '../../components/Notification';

function ProductEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState(null);

    // Form States
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [status, setStatus] = useState(1);
    const [existingImages, setExistingImages] = useState([]); // Ảnh đã có trên server
    const [newImages, setNewImages] = useState([]); // Ảnh mới chọn
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [descriptions, setDescriptions] = useState([]);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, catRes] = await Promise.all([
                    getProductById(id),
                    getCategories()
                ]);

                if (productRes.success) {
                    const p = productRes.data;
                    setName(p.name);
                    setCategoryId(p.category_id);
                    setStatus(p.status);
                    setExistingImages(p.images || []);
                    setDescriptions(p.descriptions || []);
                    setVariants(p.variants || []);
                    
                    // Tìm index của ảnh chính trong mảng ảnh cũ
                    const mainIdx = p.images.findIndex(img => img.isMain === 1);
                    setMainImageIndex(mainIdx !== -1 ? mainIdx : 0);
                }
                setCategories(catRes.data || []);
            } catch {
                setNotification({ message: "Lỗi tải dữ liệu", type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category_id', categoryId);
            formData.append('status', status);
            formData.append('mainImageIndex', mainImageIndex);
            formData.append('descriptions', JSON.stringify(descriptions));
            formData.append('variants', JSON.stringify(variants));
            formData.append('existingImages', JSON.stringify(existingImages));

            newImages.forEach(img => formData.append('images', img));

            await updateProduct(id, formData);
            setNotification({ message: 'Cập nhật thành công!', type: 'success' });
            setTimeout(() => navigate('/seller/san-pham'), 1500);
        } catch  {
            setNotification({ message: 'Lỗi cập nhật', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold">Đang tải dữ liệu sản phẩm...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
            
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft size={20}/> Quay lại
                </button>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Chỉnh sửa sản phẩm #{id}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* SECTION 1: CƠ BẢN */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Package size={20}/></div>
                        <h3 className="font-black text-gray-800 uppercase">Thông tin cơ bản</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tên sản phẩm</label>
                            <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Danh mục</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* SECTION 2: HÌNH ẢNH */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ImageIcon size={20}/></div>
                        <h3 className="font-black text-gray-800 uppercase">Hình ảnh</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {/* Ảnh cũ */}
                        {existingImages.map((img, index) => (
                            <div key={`old-${index}`} className={`relative aspect-square rounded-3xl overflow-hidden border-2 ${mainImageIndex === index ? 'border-orange-500' : 'border-transparent'}`}>
                                <img src={`${import.meta.env.VITE_CLOUDINARY_BASE_URL}/${import.meta.env.VITE_CLOUDINARY_PRODUCT}/${img.image}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setMainImageIndex(index)} className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-[10px] bg-black/50 text-white font-bold">
                                    {mainImageIndex === index ? 'ẢNH CHÍNH' : 'ĐẶT CHÍNH'}
                                </button>
                                <button type="button" onClick={() => {
                                    setExistingImages(existingImages.filter((_, i) => i !== index));
                                    if (mainImageIndex === index) setMainImageIndex(0);
                                }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><Trash2 size={14}/></button>
                            </div>
                        ))}

                        {/* Ảnh mới chuẩn bị upload */}
                        {newImages.map((img, index) => {
                            const actualIdx = existingImages.length + index;
                            return (
                                <div key={`new-${index}`} className={`relative aspect-square rounded-3xl overflow-hidden border-2 ${mainImageIndex === actualIdx ? 'border-orange-500' : 'border-transparent'}`}>
                                    <img src={URL.createObjectURL(img)} className="w-full h-full object-cover opacity-70" />
                                    <button type="button" onClick={() => setMainImageIndex(actualIdx)} className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-[10px] bg-blue-500 text-white font-bold">MỚI</button>
                                    <button type="button" onClick={() => setNewImages(newImages.filter((_, i) => i !== index))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><Trash2 size={14}/></button>
                                </div>
                            );
                        })}

                        <label className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                            <Plus className="text-gray-300" />
                            <input type="file" multiple hidden onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
                        </label>
                    </div>
                </section>

                {/* SECTION 3: MÔ TẢ (Tương tự Create) */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between mb-6">
                        <h3 className="font-black text-gray-800 uppercase flex items-center gap-2"><Info size={20}/> Mô tả</h3>
                        <button type="button" onClick={() => setDescriptions([...descriptions, {title: '', content: ''}])} className="p-2 bg-gray-100 rounded-xl"><Plus size={18}/></button>
                    </div>
                    {descriptions.map((desc, idx) => (
                        <div key={idx} className="mb-4 p-4 bg-gray-50 rounded-2xl relative">
                            <input placeholder="Tiêu đề" value={desc.title} onChange={e => {
                                const newArr = [...descriptions]; newArr[idx].title = e.target.value; setDescriptions(newArr);
                            }} className="w-full mb-2 bg-transparent border-b font-bold focus:outline-none" />
                            <textarea placeholder="Nội dung" value={desc.content} onChange={e => {
                                const newArr = [...descriptions]; newArr[idx].content = e.target.value; setDescriptions(newArr);
                            }} className="w-full bg-transparent focus:outline-none" />
                            <button type="button" onClick={() => setDescriptions(descriptions.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-400"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </section>

                {/* SECTION 4: BIẾN THỂ (Tương tự Create) */}
                <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between mb-6">
                        <h3 className="font-black text-gray-800 uppercase flex items-center gap-2"><Settings size={20}/> Phân loại</h3>
                        <button type="button" onClick={() => setVariants([...variants, {variant_name: '', variant_value: '', price: 0, quantity: 0, discount: 0, level: 1}])} className="p-2 bg-gray-100 rounded-xl"><Plus size={18}/></button>
                    </div>
                    <div className="space-y-3">
                        {variants.map((v, i) => (
                            <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-2xl relative">
                                <input placeholder="Loại" value={v.variant_name} onChange={e => {const n = [...variants]; n[i].variant_name = e.target.value; setVariants(n)}} className="bg-white p-2 rounded-lg text-sm" />
                                <input placeholder="Giá trị" value={v.variant_value} onChange={e => {const n = [...variants]; n[i].variant_value = e.target.value; setVariants(n)}} className="bg-white p-2 rounded-lg text-sm" />
                                <input type="number" placeholder="Giá" value={v.price} onChange={e => {const n = [...variants]; n[i].price = e.target.value; setVariants(n)}} className="bg-white p-2 rounded-lg text-sm" />
                                <input type="number" placeholder="Kho" value={v.quantity} onChange={e => {const n = [...variants]; n[i].quantity = e.target.value; setVariants(n)}} className="bg-white p-2 rounded-lg text-sm" />
                                <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-400 ml-auto"><Trash2 size={18}/></button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BOTTOM BAR */}
                <div className="sticky bottom-4 flex items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-2xl border border-gray-100">
                    <div className="flex gap-4">
                         <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={status === 1} onChange={e => setStatus(e.target.checked ? 1 : 0)} className="w-5 h-5 rounded-lg text-orange-500" />
                            <span className="text-sm font-bold text-gray-600 uppercase">Hoạt động</span>
                        </label>
                    </div>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all disabled:opacity-50">
                        {saving ? 'Đang lưu...' : <><Save size={20}/> Cập nhật sản phẩm</>}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProductEdit;