import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBestSeller } from '../services/productService';

function Banner() {
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const CLOUDINARY_URL = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${
        import.meta.env.VITE_CLOUDINARY_PRODUCT
    }`;

    useEffect(() => {
        const fetchBestSeller = async () => {
            try {
                const res = await getBestSeller();
                if (res.status === 'success' && res.data) {
                    setProduct(res.data);
                }
            } catch (error) {
                console.error('Lỗi lấy sản phẩm bán chạy:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBestSeller();
    }, []);

    // Dữ liệu mặc định nếu không có sản phẩm bán chạy
    const defaultData = {
        id: null,
        name: 'Smart Watch Pro Edition 2026',
        description:
            'Trải nghiệm công nghệ đỉnh cao với dòng sản phẩm mới nhất. Theo dõi sức khỏe, thông báo thông minh và thời lượng pin lên đến 14 ngày.',
        image:
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop',
    };

    const displayProduct = product || defaultData;
    const imageUrl = product?.image ? `${CLOUDINARY_URL}/${product.image}` : defaultData.image;

    if (loading)
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black">
                <Loader2 className="text-sky-500 animate-spin" size={40} />
            </div>
        );

    return (
        <section className="relative w-full h-screen overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={imageUrl}
                    alt={displayProduct.name}
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content Banner */}
            <div className="relative h-full container mx-auto px-6 flex flex-col justify-center text-white">
                <div className="max-w-2xl space-y-6">
                    <div className="flex items-center space-x-2 bg-sky-500/20 text-sky-400 w-fit px-3 py-1 rounded-full border border-sky-500/30 backdrop-blur-sm">
                        <Star size={16} fill="currentColor" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {product ? 'Sản phẩm bán chạy nhất' : 'Sản phẩm mới nhất'}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black leading-tight uppercase italic">
                        {displayProduct.name
                            .split(' ')
                            .slice(0, -2)
                            .join(' ')}{' '}
                        <br />
                        <span className="text-sky-500">
                            {displayProduct.name
                                .split(' ')
                                .slice(-2)
                                .join(' ')}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed opacity-90 line-clamp-3 font-medium">
                        {displayProduct.description}
                    </p>

                    <div className="flex items-center space-x-4 pt-4">
                        <button
                            onClick={() =>
                                displayProduct.id &&
                                navigate(`/chi-tiet-san-pham/${displayProduct.id}`)
                            }
                            className="bg-sky-500 hover:bg-white hover:text-black text-white px-8 py-4 font-black flex items-center transition-all transform hover:scale-105 border-2 border-transparent hover:border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
                        >
                            XEM CHI TIẾT <ArrowRight className="ml-2" size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Banner;
