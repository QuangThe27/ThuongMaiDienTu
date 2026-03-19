import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { Eye, Edit3, Trash2, UserCheck, Shield, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../../services/userService';
import Notification from '../../components/Notification';

function User() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Lấy thông tin user hiện tại từ localStorage
    const currentUser = JSON.parse(localStorage.getItem('userInfo'));

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

     useEffect(() => {
            const fetchUsers = async () => {
                try {
                    setLoading(true);
                    const result = await getUsers();
                    setUsers(result.data);
                } catch {
                    showNotify('Không thể tải danh sách cửa hàng.', 'error');
                } finally {
                    setLoading(false);
                }
            };
    
            fetchUsers();
        }, []);

    const handleDelete = async (id, name) => {
        // 1. Chặn ngay tại frontend
        if (String(id) === String(currentUser?.id)) {
            showNotify('Bạn không thể tự xóa chính mình!', 'error');
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}"?`)) {
            try {
                const response = await deleteUser(id);
                showNotify(response.message || 'Xóa người dùng thành công!');
                setUsers((prev) => prev.filter((u) => u.id !== id));
            } catch (err) {
                // Hiển thị lỗi từ backend (ví dụ: lỗi chặn xóa chính mình ở server)
                showNotify(err.response?.data?.message || 'Xóa thất bại', 'error');
            }
        }
    };

    const renderRole = (roleId) => {
        const roles = {
            1: { label: 'Admin', color: 'text-purple-500', icon: <Shield size={12} /> },
            2: { label: 'Seller', color: 'text-blue-600', icon: <UserCheck size={12} /> },
            3: { label: 'Customer', color: 'text-gray-600', icon: <UserCheck size={12} /> },
        };
        const currentRole = roles[roleId] || roles[0];
        return (
            <div
                className={`flex items-center justify-center gap-1.5 font-black text-[10px] uppercase ${currentRole.color}`}
            >
                {currentRole.icon} {currentRole.label}
            </div>
        );
    };

    return (
        <div className="animate-fade-in relative">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <AdminHeader
                title="Quản lý Người dùng"
                searchPlaceholder="Tìm tên hoặc email..."
                createLink="/quan-ly/them-nguoi-dung"
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden text-nowrap">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-16 text-center">
                                    STT
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-56">
                                    Họ và tên
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-60">
                                    Email
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-40">
                                    Số điện thoại
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-32 text-center">
                                    Vai trò
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-40 text-center">
                                    Chức năng
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => {
                                    const isMe = String(user.id) === String(currentUser?.id);
                                    return (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-blue-50/30 transition-colors"
                                        >
                                            <td className="p-4 text-sm font-medium text-gray-400 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-gray-800">
                                                    {user.name} {isMe && '(Tôi)'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-blue-500">
                                                {user.email}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {user.phone}
                                            </td>
                                            <td className="p-4 text-center">
                                                {renderRole(user.role)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        to={`/quan-ly/sua-nguoi-dung/${user.id}`}
                                                        className="p-2 text-gray-400 hover:text-orange-500"
                                                    >
                                                        <Edit3 size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(user.id, user.fullname)
                                                        }
                                                        disabled={isMe}
                                                        title={
                                                            isMe
                                                                ? 'Bạn không thể xóa chính mình'
                                                                : 'Xóa người dùng'
                                                        }
                                                        className={`p-2 rounded-lg transition-all ${
                                                            isMe
                                                                ? 'opacity-20 cursor-not-allowed text-gray-300'
                                                                : 'text-gray-400 hover:text-red-500 hover:bg-white hover:border-red-100 shadow-sm'
                                                        }`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default User;