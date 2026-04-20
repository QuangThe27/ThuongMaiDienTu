const { Server } = require('socket.io');
const ChatService = require('../modules/chat/chat.service');

let io; // Khai báo biến io để export dùng ở các file khác

const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: 'http://localhost:5173' },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Room để nhận thông báo cá nhân (ví dụ: cập nhật giỏ hàng)
        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their private room`);
        });

        // Chat Room Logic (Giữ nguyên của bạn)
        socket.on('join_room', (data) => {
            const roomName = `room_${data.userId}_${data.storeId}`;
            socket.join(roomName);
        });

        socket.on('join_store_lobby', (storeId) => {
            socket.join(`store_lobby_${storeId}`);
            console.log(`Store ${storeId} joined lobby`);
        });

        socket.on('send_message', async (data) => {
            try {
                const newMessage = await ChatService.createChat({
                    user_id: data.userId,
                    store_id: data.storeId,
                    sender_type: data.senderType,
                    message: data.message,
                });

                const roomName = `room_${data.userId}_${data.storeId}`;
                io.to(roomName).emit('receive_message', newMessage);

                // Gửi thông báo đến Lobby của Store để cập nhật danh sách hội thoại
                io.to(`store_lobby_${data.storeId}`).emit('new_conversation_update', newMessage);
            } catch (error) {
                console.error('Socket error:', error.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

// Hàm helper để gửi sự kiện từ bất kỳ đâu trong BE
const getIO = () => {
    if (!io) throw new Error('Socket.io chưa được khởi tạo!');
    return io;
};

module.exports = { initSocket, getIO };
