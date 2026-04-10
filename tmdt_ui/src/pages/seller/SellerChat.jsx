import React, { useEffect, useState } from 'react';
import SellerHeader from '../../components/SellerHeader';
import { MessageSquare, User, Loader2, X, Circle } from 'lucide-react';
import { getConversations } from '../../services/chatService';
import { getStoreByUserId } from '../../services/storeService';
import { useAuth } from '../../contexts/AuthContext';
import Notification from '../../components/Notification';
import ChatBox from '../../components/ChatBox';

function SellerChat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [storeInfo, setStoreInfo] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const CLOUDINARY_AVATAR = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}${
        import.meta.env.VITE_CLOUDINARY_AVATAR
    }`;

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    useEffect(() => {
        const initData = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                const storeRes = await getStoreByUserId(user.id);
                const storeData = storeRes?.data || storeRes;

                if (storeData && storeData.id) {
                    setStoreInfo(storeData);
                    const result = await getConversations(storeData.id);
                    setConversations(result.data || []);
                } else {
                    showNotify('Không tìm thấy thông tin cửa hàng.', 'error');
                }
            } catch {
                showNotify('Lỗi khi tải danh sách tin nhắn.', 'error');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [user?.id]);

    return (
        <div className="animate-fade-in relative">
            {notification && (
                <Notification {...notification} onClose={() => setNotification(null)} />
            )}

            <SellerHeader
                subTitle="Quản lý hội thoại và chăm sóc khách hàng"
                searchPlaceholder="Tìm tên khách hàng..."
                hideCreate={true}
            />

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50/50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center w-16">
                                    STT
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase w-24 text-center">
                                    Ảnh
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">
                                    Khách hàng
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase">
                                    Tin nhắn cuối
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Ngày gửi
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Trạng thái
                                </th>
                                <th className="p-4 font-bold text-gray-400 text-[11px] uppercase text-center">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center">
                                        <Loader2 className="animate-spin mx-auto text-orange-500" />
                                    </td>
                                </tr>
                            ) : conversations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-10 text-center text-gray-400">
                                        Chưa có khách hàng nào.
                                    </td>
                                </tr>
                            ) : (
                                conversations.map((conv, index) => (
                                    <tr
                                        key={conv.user_id}
                                        className={`hover:bg-orange-50/20 transition-colors ${
                                            conv.is_read === 0 ? 'bg-blue-50/30' : ''
                                        }`}
                                    >
                                        <td className="p-4 text-sm text-center text-gray-400 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center">
                                                {conv.user_avatar ? (
                                                    <img
                                                        src={`${CLOUDINARY_AVATAR}/${conv.user_avatar}`}
                                                        className="w-full h-full object-cover"
                                                        alt=""
                                                    />
                                                ) : (
                                                    <User className="text-gray-300" size={20} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`font-bold ${
                                                    conv.is_read === 0
                                                        ? 'text-blue-600'
                                                        : 'text-gray-800'
                                                }`}
                                            >
                                                {conv.user_name}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p
                                                className={`text-sm truncate max-w-[200px] ${
                                                    conv.is_read === 0
                                                        ? 'font-bold text-gray-900'
                                                        : 'text-gray-500'
                                                }`}
                                            >
                                                {conv.last_message}
                                            </p>
                                        </td>
                                        <td className="p-4 text-center text-sm text-gray-500 font-medium">
                                            {new Date(conv.last_time).toLocaleDateString('vi-VN')}
                                        </td>
                                        {/* Cột Trạng thái mới */}
                                        <td className="p-4 text-center">
                                            {conv.is_read === 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <Circle className="w-2 h-2 mr-1.5 fill-current" />
                                                    Mới
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Đã đọc
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => setSelectedUser(conv)}
                                                className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all relative"
                                            >
                                                <MessageSquare size={20} />
                                                {conv.is_read === 0 && (
                                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ChatBox Overlay */}
            {selectedUser && storeInfo && (
                <div className="fixed bottom-4 right-4 z-[100] w-[380px] shadow-2xl animate-slide-up">
                    <div className="relative group">
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute -top-2 -left-2 z-[110] bg-white text-gray-500 hover:text-red-500 rounded-full p-1 shadow-md border border-gray-100 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <ChatBox
                            userId={selectedUser.user_id}
                            storeId={storeInfo.id}
                            storeName={selectedUser.user_name}
                            isAdminView={true}
                            storeLogo={
                                selectedUser.user_avatar
                                    ? `${CLOUDINARY_AVATAR}/${selectedUser.user_avatar}`
                                    : ''
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default SellerChat;
