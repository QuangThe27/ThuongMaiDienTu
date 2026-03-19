import { Mail, KeyRound, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/authService';
import { useNotification } from '../../contexts/NotificationContext';
import './AuthStyles.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await forgotPasswordApi(email);
            showNotification(res.message, 'success');
            navigate('/dang-nhap');
        } catch (err) {
            showNotification(err.message || 'Gửi yêu cầu thất bại', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-scope">
            <div className="auth-card">
                <div className="auth-avatar-wrapper">
                    <div className="auth-avatar-icon">
                        <KeyRound size={26} />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-700">Quên mật khẩu</h2>
                <p className="auth-text-sm mt-2 mb-8">Chúng tôi sẽ gửi mật khẩu mới qua email</p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                            Email đăng ký <span className="text-red-500">*</span>
                        </label>
                        <div className="auth-input-group">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="Nhập email của bạn"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button flex items-center justify-center disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                        ) : (
                            'Gửi yêu cầu'
                        )}
                    </button>
                </form>

                <p className="auth-text-sm mt-8">
                    Quay lại{' '}
                    <Link to="/dang-nhap" className="auth-link">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;