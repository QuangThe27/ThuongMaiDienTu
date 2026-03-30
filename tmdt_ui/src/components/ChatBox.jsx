import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import socket from '../socket';
import { getChatRoom } from '../services/chatService';

function ChatBox({ userId, storeId, storeName, storeLogo, isAdminView = false }) {
    // Nếu là AdminView, mặc định mở luôn (vì nhấn từ bảng), ngược lại dùng nút bấm
    const [isOpen, setIsOpen] = useState(isAdminView ? true : false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    // 1. Lấy lịch sử chat và gia nhập phòng socket
    useEffect(() => {
        if (isOpen && userId && storeId) {
            const fetchHistory = async () => {
                try {
                    const res = await getChatRoom(userId, storeId);
                    if (res.data) setMessages(res.data);
                } catch (error) {
                    console.error("Lỗi lấy lịch sử chat:", error);
                }
            };

            fetchHistory();

            // Tham gia vào phòng chat riêng
            socket.emit('join_room', { userId, storeId });

            // Lắng nghe tin nhắn mới
            socket.on('receive_message', (newMessage) => {
                setMessages((prev) => [...prev, newMessage]);
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [isOpen, userId, storeId]);

    // 2. Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const messageData = {
            userId: userId,
            storeId: storeId,
            // SỬA LỖI: Nếu là Admin nhắn thì type = 2, ngược lại = 1
            senderType: isAdminView ? 2 : 1, 
            message: inputValue
        };

        socket.emit('send_message', messageData);
        setInputValue('');
    };

    // Logic kiểm tra tin nhắn nào là của "tôi" để hiển thị bên phải
    const isMyMessage = (msgType) => {
        if (isAdminView) return msgType === 2; // Admin thấy tin nhắn type 2 bên phải
        return msgType === 1; // User thấy tin nhắn type 1 bên phải
    };

    return (
        <div className={isAdminView ? "" : "fixed bottom-6 right-6 z-50"}>
            {/* Nút bấm mở chat (Chỉ hiện nếu không phải AdminView) */}
            {!isOpen && !isAdminView && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-sky-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-sky-600 transition-all hover:scale-110 active:scale-95"
                >
                    <MessageCircle size={30} />
                </button>
            )}

            {/* Khung Chat */}
            {isOpen && (
                <div className="w-80 md:w-96 h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-black text-white flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                                <img src={storeLogo} alt="logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-sm uppercase tracking-tight">{storeName}</span>
                        </div>
                        {/* Ẩn nút X nếu là AdminView (vì nút X đã có ở ngoài SellerChat) */}
                        {!isAdminView && (
                            <button onClick={() => setIsOpen(false)} className="hover:text-sky-400 transition-colors">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Messages Body */}
                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${isMyMessage(msg.sender_type) ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                                    isMyMessage(msg.sender_type) 
                                    ? 'bg-sky-500 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                }`}>
                                    {msg.message}
                                    <p className={`text-[9px] mt-1 opacity-70 ${isMyMessage(msg.sender_type) ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <p className="text-center text-gray-400 text-xs mt-10 italic uppercase font-bold tracking-widest">Bắt đầu cuộc trò chuyện...</p>
                        )}
                    </div>

                    {/* Input Footer */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex items-center space-x-2">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                        />
                        <button type="submit" className="text-sky-500 hover:text-sky-600 transition-colors p-1">
                            <Send size={22} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ChatBox;