import { User, Lock, Mail, Phone, MapPin, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';
import './AuthStyles.css';

function Register() {
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '', // Đổi từ fullName thành name
        password: '',
        email: '',
        phone: '',
        address: '',
    });

    const inputFields = [
        { name: 'name', icon: User, placeholder: 'Họ và tên', type: 'text' },
        { name: 'email', icon: Mail, placeholder: 'Email', type: 'email' },
        { name: 'password', icon: Lock, placeholder: 'Mật khẩu', type: 'password' },
        { name: 'phone', icon: Phone, placeholder: 'Số điện thoại', type: 'text' },
        { name: 'address', icon: MapPin, placeholder: 'Địa chỉ', type: 'text' },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gửi trực tiếp formData vì các key đã khớp với BE (name, email, password, phone, address)
            const response = await registerApi(formData);
            showNotification(response.message || 'Đăng ký thành công!', 'success');
            navigate('/dang-nhap');
        } catch (err) {
            showNotification(err.message || 'Đã có lỗi xảy ra', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-scope">
            <div className="auth-card">
                <div className="auth-avatar-wrapper">
                    <div className="auth-avatar-icon">
                        <UserPlus size={26} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-700">Đăng ký tài khoản</h2>
                <p className="auth-text-sm mt-2 mb-8">Điền thông tin bên dưới</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {inputFields.map((item, index) => (
                        <div key={index} className="relative">
                            <label className="text-sm font-medium text-gray-600 mb-1 block">
                                {item.placeholder} <span className="text-red-500">*</span>
                            </label>
                            <div className="auth-input-group">
                                <item.icon size={18} className="input-icon" />
                                <input
                                    name={item.name}
                                    value={formData[item.name]}
                                    onChange={handleChange}
                                    type={
                                        item.name === 'password'
                                            ? showPassword ? 'text' : 'password'
                                            : item.type
                                    }
                                    placeholder={item.placeholder}
                                    className="auth-input"
                                    required
                                    style={item.name === 'password' ? { paddingRight: '3rem' } : {}}
                                />

                                {item.name === 'password' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    <button type="submit" className="auth-button mt-4" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="auth-text-sm mt-8">
                    Đã có tài khoản?{' '}
                    <Link to="/dang-nhap" className="auth-link">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;