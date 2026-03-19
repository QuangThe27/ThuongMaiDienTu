import { Phone, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-blue-900 text-white">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT */}
                    <div className="space-y-4">
                        {/* Logo */}
                        <Link to="/" className="text-2xl font-bold tracking-wide text-white">
                            LaundryCare
                        </Link>

                        {/* Thông tin cửa hàng */}
                        <div className="text-sm leading-relaxed text-blue-100">
                            <p className="font-semibold text-white">Cửa hàng giặt sấy Huy Quý</p>
                            <p>
                                Dịch vụ giặt sấy chuyên nghiệp – Nhanh chóng – An toàn – Tiết kiệm
                            </p>
                        </div>

                        {/* Liên hệ cửa hàng */}
                        <div className="space-y-2 text-sm text-blue-100">
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>Hotline: 1900 1234</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>laundrycare@gmail.com</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>Hà Nội, Việt Nam</span>
                            </div>
                        </div>

                        {/* Thông tin xây dựng website */}
                        <div className="pt-4 border-t border-blue-700 text-sm text-blue-200">
                            <p>
                                Xây dựng website:{' '}
                                <span className="font-medium text-white">Nguyễn Thế Quang</span>
                            </p>
                            <p>Zalo: 0971625535</p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="w-full h-[260px] md:h-full rounded overflow-hidden border border-blue-700">
                        <iframe
                            src="https://www.google.com/maps?q=21.14311, 105.93944&z=17&output=embed"
                            className="w-full h-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="bg-blue-950 text-center text-xs text-blue-300 py-3">
                © {new Date().getFullYear()} LaundryCare. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
