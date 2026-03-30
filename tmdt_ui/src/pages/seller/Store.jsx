import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Store as StoreIcon, Package, Info, ArrowRight, LayoutGrid } from 'lucide-react';
import { getStoreById } from '../../services/storeService';
import { getProductsByStore } from '../../services/productService';

function Store() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const CLOUDINARY_PRODUCT = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_PRODUCT}`;
    const CLOUDINARY_STORE = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_STORE}`;

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const [storeRes, productsRes] = await Promise.all([
                    getStoreById(id),
                    getProductsByStore(id)
                ]);
                if (storeRes) setStore(storeRes.data);
                if (productsRes.success) setProducts(productsRes.data);
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStoreData();
    }, [id]);

    // Logic tìm kiếm sản phẩm
    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-sky-500 italic uppercase">Đang tải cửa hàng...</div>;
    if (!store) return <div className="min-h-screen flex items-center justify-center font-black text-red-500">KHÔNG TÌM THẤY CỬA HÀNG</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* Banner & Header Store */}
            <div className="relative h-[400px] w-full overflow-hidden bg-gray-900">
                {store.image_sub ? (
                    <img src={`${CLOUDINARY_STORE}/${store.image_sub}`} className="w-full h-full object-cover opacity-60" alt="banner" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black opacity-60"></div>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="container mx-auto px-4 flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl overflow-hidden mb-6 bg-white transition-transform hover:scale-105 duration-500">
                            <img src={`${CLOUDINARY_STORE}/${store.logo}`} className="w-full h-full object-cover" alt="logo" />
                        </div>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-lg">
                            {store.store_name}
                        </h1>
                        <p className="text-gray-200 max-w-2xl font-medium text-lg italic">"{store.description}"</p>
                    </div>
                </div>
            </div>

            {/* Thanh công cụ: Tìm kiếm & Thống kê */}
            <div className="top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                        <div className="flex items-center space-x-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sản phẩm</span>
                                <span className="text-2xl font-black">{products.length}</span>
                            </div>
                            <div className="h-10 w-[1px] bg-gray-200"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Trạng thái</span>
                                <span className="text-sm font-bold text-green-500 uppercase italic">Hoạt động</span>
                            </div>
                        </div>

                        {/* Ô tìm kiếm hiện đại */}
                        <div className="relative w-full lg:w-[500px] group">
                            <input 
                                type="text"
                                placeholder="Tìm kiếm sản phẩm trong cửa hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white transition-all outline-none font-bold uppercase text-xs tracking-wider"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="container mx-auto px-4 py-16">
                <div className="flex items-center space-x-4 mb-12">
                    <LayoutGrid size={24} className="text-sky-500" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Bộ sưu tập sản phẩm</h2>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((p) => (
                            <div 
                                key={p.id} 
                                onClick={() => navigate(`/chi-tiet-san-pham/${p.id}`)}
                                className="group cursor-pointer bg-white border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col"
                            >
                                <div className="aspect-[3/4] overflow-hidden relative">
                                    <img 
                                        src={p.images?.[0] ? `${CLOUDINARY_PRODUCT}/${p.images[0].image}` : '/placeholder.png'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={p.name} 
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="bg-white text-black px-6 py-3 font-black uppercase text-[10px] tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform">Xem chi tiết</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2">Category #{p.category_id}</p>
                                    <h3 className="font-bold text-gray-900 uppercase text-sm mb-4 line-clamp-2 min-h-[40px] group-hover:text-sky-600 transition-colors">
                                        {p.name}
                                    </h3>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                        <span className="text-lg font-black text-black">
                                            {p.variants?.[0] ? Number(p.variants[0].price).toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-gray-50 border-2 border-dashed border-gray-200">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="font-black text-gray-400 uppercase tracking-widest">Không tìm thấy sản phẩm nào phù hợp</p>
                    </div>
                )}
            </div>

            {/* Footer Store */}
            <div className="bg-black text-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <StoreIcon size={40} className="mx-auto mb-6 text-sky-500" />
                    <h2 className="text-2xl font-black uppercase mb-4 italic">Cảm ơn bạn đã ghé thăm {store.store_name}</h2>
                    <p className="text-gray-500 text-sm tracking-widest uppercase font-bold">Thương hiệu uy tín - Chất lượng hàng đầu</p>
                </div>
            </div>
        </div>
    );
}

export default Store;