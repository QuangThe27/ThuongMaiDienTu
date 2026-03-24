import { Phone, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="bg-blue-900 text-white">
            <div className="bg-blue-950 text-center text-xs text-blue-300 py-3">
                © {new Date().getFullYear()} Thương Mại Điện Tử. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
