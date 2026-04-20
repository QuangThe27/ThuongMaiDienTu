import React, { useEffect, useState } from 'react';
import SellerHeader from '../../components/SellerHeader';
import { MessageSquare, User, Loader2, X, Circle } from 'lucide-react';
import { getConversations, markAsRead } from '../../services/chatService'; // Import service mới
import { getStoreByUserId } from '../../services/storeService';
import { useAuth } from '../../contexts/AuthContext';
import Notification from '../../components/Notification';
import ChatBox from '../../components/ChatBox';
import socket from '../../socket';

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

    const fetchConversations = async (storeId) => {
        try {
            const result = await getConversations(storeId);
            setConversations(result.data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
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
                    await fetchConversations(storeData.id);
                    socket.emit('join_store_lobby', storeData.id);
                }
            } catch {
                showNotify('Lỗi khi tải dữ liệu.', 'error');
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [user?.id]);

    useEffect(() => {
        socket.on('new_conversation_update', (newMessage) => {
            setConversations((prev) => {
                const existingIdx = prev.findIndex((c) => c.user_id === newMessage.user_id);
                let updatedList = [...prev];
                const sType = Number(newMessage.sender_type);

                if (existingIdx !== -1) {
                    const updatedConv = {
                        ...updatedList[existingIdx],
                        last_message: newMessage.message,
                        last_time: newMessage.created_at,
                        sender_type: sType,
                        is_read: 0,
                    };
                    updatedList.splice(existingIdx, 1);
                    updatedList.unshift(updatedConv);
                } else {
                    if (storeInfo?.id) fetchConversations(storeInfo.id);
                }
                return updatedList;
            });
        });
        return () => socket.off('new_conversation_update');
    }, [storeInfo?.id]);

    const handleOpenChat = async (conv) => {
        setSelectedUser(conv);

        // Cập nhật CSDL thông qua Service nếu tin nhắn đang ở trạng thái chưa đọc
        if (conv.is_read === 0) {
            try {
                // Cập nhật UI ngay lập tức (Optimistic Update)
                setConversations((prev) =>
                    prev.map((item) =>
                        item.user_id === conv.user_id ? { ...item, is_read: 1 } : item
                    )
                );

                // Gọi Service để lưu vào CSDL
                await markAsRead(conv.user_id, storeInfo.id);
            } catch (error) {
                console.error('Lỗi cập nhật CSDL:', error);
                // Nếu lỗi thì nên fetch lại danh sách để đảm bảo tính đúng đắn
                fetchConversations(storeInfo.id);
            }
        }
    };

    const isNewMessage = (conv) => {
        const sType = Number(conv.sender_type);
        // Theo yêu cầu: sender_type = 1 (Store) thì check is_read, sender_type = 2 mặc định đã đọc (false)
        if (sType === 1) {
            return conv.is_read === 0;
        }
        return false;
    };

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
                                conversations.map((conv, index) => {
                                    const hasNew = isNewMessage(conv);
                                    return (
                                        <tr
                                            key={conv.user_id}
                                            className={`hover:bg-orange-50/20 transition-colors ${
                                                hasNew ? 'bg-orange-50/40' : ''
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
                                                        hasNew ? 'text-gray-900' : 'text-gray-600'
                                                    }`}
                                                >
                                                    {conv.user_name}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p
                                                    className={`text-sm truncate max-w-[200px] ${
                                                        hasNew
                                                            ? 'font-bold text-gray-900'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {conv.last_message}
                                                </p>
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-500 font-medium">
                                                {new Date(conv.last_time).toLocaleDateString(
                                                    'vi-VN'
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {hasNew ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 animate-pulse">
                                                        <Circle className="w-2 h-2 mr-1.5 fill-current" />{' '}
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
                                                    onClick={() => handleOpenChat(conv)}
                                                    className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all relative"
                                                >
                                                    <MessageSquare size={20} />
                                                    {hasNew && (
                                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
