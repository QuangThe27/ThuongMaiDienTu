const ChatModel = require('./chat.model');

const getAll = async () => {
    return await ChatModel.findAll();
};

const createChat = async (payload) => {
    const chatId = await ChatModel.create(payload);
    return { id: chatId, ...payload, created_at: new Date() };
};

const getDetailRoom = async (userId, storeId) => {
    return await ChatModel.findChatRoom(userId, storeId);
};

const getStoreConversations = async (storeId) => {
    if (!storeId) throw new Error("Store ID không hợp lệ");
    return await ChatModel.findConversationsByStore(storeId);
};

module.exports = { getAll, createChat, getDetailRoom, getStoreConversations };