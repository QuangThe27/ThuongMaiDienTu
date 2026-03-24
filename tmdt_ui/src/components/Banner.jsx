import { ArrowRight, Star } from 'lucide-react';

function Banner() {
    return ( 
        <>
         {/* Hero Banner Section */}
            <section className="relative w-full h-screen overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop" 
                        alt="Product Banner" 
                        className="w-full h-full object-cover"
                    />
                    {/* Lớp phủ Overlay tối để làm nổi bật text */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                </div>

                {/* Content Banner */}
                <div className="relative h-full container mx-auto px-6 flex flex-col justify-center text-white">
                    <div className="max-w-2xl space-y-6">
                        <div className="flex items-center space-x-2 bg-sky-500/20 text-sky-400 w-fit px-3 py-1 rounded-full border border-sky-500/30">
                            <Star size={16} fill="currentColor" />
                            <span className="text-xs font-bold uppercase tracking-widest">Sản phẩm bán chạy nhất</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-black leading-tight">
                            Smart Watch <br/>
                            <span className="text-sky-500">Pro Edition 2026</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-gray-200 leading-relaxed opacity-90">
                            Trải nghiệm công nghệ đỉnh cao với dòng sản phẩm mới nhất. 
                            Theo dõi sức khỏe, thông báo thông minh và thời lượng pin lên đến 14 ngày.
                        </p>

                        <div className="flex items-center space-x-4 pt-4">
                            <button className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-4 rounded-xl font-bold flex items-center transition-all transform hover:scale-105 shadow-lg">
                                Xem chi tiết <ArrowRight className="ml-2" size={20} />
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold transition-all">
                                Khám phá thêm
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
     );
}

export default Banner;