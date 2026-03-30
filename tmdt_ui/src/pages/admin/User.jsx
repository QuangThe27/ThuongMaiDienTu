import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { Edit3, Trash2, UserCheck, Shield, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../../services/userService';
import Notification from '../../components/Notification';
import { exportToExcel } from '../../utils/excelUtils'; // Import helper

function User() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // State cho dữ liệu sau khi lọc
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
                setFilteredUsers(result.data); // Ban đầu filtered = gốc
            } catch {
                showNotify('Không thể tải danh sách người dùng.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Xử lý Tìm kiếm
    useEffect(() => {
        const filtered = users.filter(user => 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    // Xử lý Xuất Excel
    const handleExportExcel = () => {
        if (filteredUsers.length === 0) {
            showNotify('Không có dữ liệu để xuất!', 'error');
            return;
        }

        // Format lại dữ liệu để file Excel hiển thị đẹp hơn
        const dataToExport = filteredUsers.map((u, index) => ({
            "STT": index + 1,
            "Họ và Tên": u.name,
            "Email": u.email,
            "Số điện thoại": u.phone,
            "Vai trò": u.role === 1 ? 'Admin' : (u.role === 2 ? 'Seller' : 'Customer'),
            "Ngày tạo": new Date(u.timestamp).toLocaleDateString('vi-VN')
        }));

        exportToExcel(dataToExport, 'DanhSachNguoiDung');
    };

    const handleDelete = async (id, name) => {
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
        const currentRole = roles[roleId] || { label: 'Unknown', color: 'text-gray-400', icon: null };
        return (
            <div className={`flex items-center justify-center gap-1.5 font-black text-[10px] uppercase ${currentRole.color}`}>
                {currentRole.icon} {currentRole.label}
            </div>
        );
    };

    return (
        <div className="animate-fade-in relative">
            {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

            <AdminHeader
                title="Quản lý Người dùng"
                searchPlaceholder="Tìm tên, email hoặc SĐT..."
                createLink="/quan-ly/them-nguoi-dung"
                onSearch={(val) => setSearchTerm(val)} // Cập nhật search term
                onExport={handleExportExcel} // Gọi hàm xuất excel
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-16 text-center">STT</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-56">Họ và tên</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-60">Email</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-40">Số điện thoại</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-32 text-center">Vai trò</th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-40 text-center">Chức năng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400">
                                        <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400 font-medium">Không tìm thấy người dùng phù hợp.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => {
                                    const isMe = String(user.id) === String(currentUser?.id);
                                    return (
                                        <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-4 text-sm font-medium text-gray-400 text-center">{index + 1}</td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-gray-800">{user.name} {isMe && '(Tôi)'}</span>
                                            </td>
                                            <td className="p-4 text-sm text-blue-500">{user.email}</td>
                                            <td className="p-4 text-sm text-gray-600">{user.phone}</td>
                                            <td className="p-4 text-center">{renderRole(user.role)}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link to={`/quan-ly/sua-nguoi-dung/${user.id}`} className="p-2 text-gray-400 hover:text-orange-500">
                                                        <Edit3 size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(user.id, user.name)}
                                                        disabled={isMe}
                                                        className={`p-2 rounded-lg transition-all ${isMe ? 'opacity-20 cursor-not-allowed' : 'text-gray-400 hover:text-red-500'}`}
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