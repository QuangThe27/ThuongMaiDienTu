import { User, Lock, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import './AuthStyles.css';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    // Hàm bổ trợ để xác định đường dẫn dựa trên role
    const getRedirectPath = (role) => {
        switch (
            Number(role) // Ép kiểu số để tránh lỗi so sánh chuỗi/số
        ) {
            case 1:
                return '/admin';
            case 2:
                return '/seller';
            case 3:
                return '/';
            default:
                return '/';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await loginApi(email, password);

            // Giả định backend trả về: res.data.user = { id: 1, role: 1, ... }
            if (res.data && res.data.accessToken) {
                const userData = res.data.user;
                const token = res.data.accessToken;

                // 1. Cập nhật context và localStorage
                login(userData, token);

                // 2. Thông báo thành công
                showNotification(res.message || 'Đăng nhập thành công', 'success');

                // 3. Điều hướng dựa trên role
                const targetPath = getRedirectPath(userData.role);
                navigate(targetPath);
            }
        } catch (err) {
            showNotification(
                err.response?.data?.message || err.message || 'Đăng nhập thất bại',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-scope">
            <div className="auth-card">
                <div className="auth-avatar-wrapper">
                    <div className="auth-avatar-icon">
                        <User size={26} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-700">Chào mừng trở lại</h2>
                <p className="auth-text-sm mt-2 mb-8">Vui lòng đăng nhập để tiếp tục</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            className="auth-input"
                            style={{ paddingRight: '3rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="text-right">
                        <Link
                            to="/quen-mat-khau"
                            className="auth-text-sm hover:text-gray-700 transition"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="auth-button flex items-center justify-center disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                <p className="auth-text-sm mt-8">
                    Chưa có tài khoản?{' '}
                    <Link to="/dang-ky" className="auth-link">
                        Đăng ký
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
