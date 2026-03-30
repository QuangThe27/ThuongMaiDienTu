const { Server } = require('socket.io');
const ChatService = require('../modules/chat/chat.service');

const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "http://localhost:5173" } // Cấu hình cho FE truy cập
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Tham gia vào một phòng cụ thể dựa trên UserId và StoreId
        socket.on('join_room', (data) => {
            const roomName = `room_${data.userId}_${data.storeId}`;
            socket.join(roomName);
            console.log(`User joined room: ${roomName}`);
        });

        // Lắng nghe tin nhắn gửi lên
        socket.on('send_message', async (data) => {
            try {
                // 1. Lưu vào Database thông qua Service
                const newMessage = await ChatService.createChat({
                    user_id: data.userId,
                    store_id: data.storeId,
                    sender_type: data.senderType, // 1: user, 2: store
                    message: data.message
                });

                // 2. Gửi lại cho những người trong phòng đó
                const roomName = `room_${data.userId}_${data.storeId}`;
                io.to(roomName).emit('receive_message', newMessage);
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

module.exports = initSocket;