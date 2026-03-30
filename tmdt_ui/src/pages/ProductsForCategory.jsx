import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, Eye, ArrowLeft, Filter } from 'lucide-react';
import { getProductsByCategory } from '../services/productService';

function ProductsForCategory() {
    const { id } = useParams(); // Lấy categoryId từ URL
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_PRODUCT}`;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await getProductsByCategory(id);
                if (res.success) {
                    setProducts(res.data);
                }
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [id]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    return (
        <div className="w-full min-h-screen bg-gray-50 pt-24 pb-20">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <Link to="/" className="flex items-center text-gray-500 hover:text-sky-500 transition-colors mb-2 text-sm font-bold uppercase tracking-wider">
                            <ArrowLeft size={16} className="mr-2" /> Quay lại trang chủ
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">
                            Danh mục <span className="text-sky-500">Sản phẩm</span>
                        </h1>
                        <p className="text-gray-400 mt-1 font-medium">Tìm thấy {filteredProducts.length} sản phẩm phù hợp</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Tìm trong danh mục này..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none shadow-sm transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {/* Grid Sản phẩm */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {filteredProducts.map((product) => {
                                const mainImg = product.images?.find(img => img.isMain === 1)?.image;
                                const imageUrl = mainImg ? `${CLOUDINARY_URL}/${mainImg}` : 'https://via.placeholder.com/300x400';
                                const latestVariant = product.variants?.[product.variants.length - 1];
                                const price = latestVariant ? Number(latestVariant.price).toLocaleString('vi-VN') : 'Liên hệ';

                                return (
                                    <div 
                                        key={product.id} 
                                        className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-white transition-all duration-500 hover:-translate-y-2"
                                    >
                                        <img 
                                            src={imageUrl} 
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        
                                        {/* Overlay thông tin */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 opacity-90 group-hover:opacity-100">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-white font-bold text-xl mb-2 line-clamp-2 uppercase leading-tight tracking-tight">
                                                    {product.name}
                                                </h3>
                                                <div className="flex justify-between items-center border-t border-white/20 pt-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sky-400 font-black text-2xl">
                                                            {price} <small className="text-xs uppercase">đ</small>
                                                        </span>
                                                    </div>
                                                    <Link 
                                                        to={`/chi-tiet-san-pham/${product.id}`} 
                                                        className="bg-sky-500 text-white p-3 rounded-full hover:bg-white hover:text-sky-500 transition-all shadow-lg"
                                                    >
                                                        <Eye size={20} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-40 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                                <h2 className="text-xl font-bold text-gray-500">Không có sản phẩm nào!</h2>
                                <p className="text-gray-400">Vui lòng quay lại sau hoặc thử từ khóa khác.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ProductsForCategory;