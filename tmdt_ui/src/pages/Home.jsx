import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Eye } from 'lucide-react';
import Banner from '../components/Banner';
import { getProducts } from '../services/productService';
import { Link } from 'react-router-dom';

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(20);

    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${import.meta.env.VITE_CLOUDINARY_PRODUCT}`;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await getProducts();
                if (res.success) {
                    setProducts(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Xử lý lọc sản phẩm theo tên (Search)
    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    // Sản phẩm hiển thị theo giới hạn "Xem thêm"
    const displayProducts = filteredProducts.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 20);
    };

    return (
        <div className="w-full bg-white">
            <Banner />

            <div className="container mx-auto px-4 py-12">
                {/* Thanh Search */}
                <div className="max-w-xl mx-auto mb-16 relative">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-b-2 border-gray-200 focus:border-sky-500 outline-none text-lg transition-all"
                        />
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500" size={24} />
                    </div>
                </div>

                {/* Grid Sản phẩm */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Đang tải sản phẩm...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {displayProducts.map((product) => {
                                // Lấy ảnh chính (isMain = 1)
                                const mainImg = product.images?.find(img => img.isMain === 1)?.image;
                                const imageUrl = mainImg ? `${CLOUDINARY_URL}/${mainImg}` : 'https://via.placeholder.com/300x400';
                                
                                // Lấy variant mới nhất (dựa trên id lớn nhất hoặc index cuối)
                                const latestVariant = product.variants?.[product.variants.length - 1];
                                const price = latestVariant ? Number(latestVariant.price).toLocaleString('vi-VN') : 'Liên hệ';

                                return (
                                    <div 
                                        key={product.id} 
                                        className="relative aspect-[3/4] overflow-hidden group cursor-pointer"
                                    >
                                        {/* Image nền */}
                                        <img 
                                            src={imageUrl} 
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        
                                        {/* Overlay thông tin đè lên ảnh */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                                            <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-white font-bold text-lg mb-1 truncate uppercase tracking-tight">
                                                    {product.name}
                                                </h3>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sky-400 font-black text-xl">
                                                        {price} <small className="text-xs uppercase">đ</small>
                                                    </span>
                                                  <Link 
                                                        to={`/chi-tiet-san-pham/${product.id}`} 
                                                        className="bg-white text-black p-2 hover:bg-sky-500 hover:text-white transition-colors"
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

                        {/* Nút Xem thêm */}
                        {visibleCount < filteredProducts.length && (
                            <div className="flex justify-center mt-16">
                                <button 
                                    onClick={handleLoadMore}
                                    className="flex items-center space-x-2 border-2 border-black px-10 py-3 font-bold hover:bg-black hover:text-white transition-all uppercase tracking-widest text-sm"
                                >
                                    <span>Xem thêm sản phẩm</span>
                                    <Plus size={18} />
                                </button>
                            </div>
                        )}
                        
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-20 text-gray-400 italic">
                                Không tìm thấy sản phẩm phù hợp.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;