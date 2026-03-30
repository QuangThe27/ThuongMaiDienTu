const ChatService = require('./chat.service');

const getAll = async (req, res) => {
    try {
        const data = await ChatService.getAll();
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChatRoom = async (req, res) => {
    try {
        const { userId, storeId } = req.params;
        const data = await ChatService.getDetailRoom(userId, storeId);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
        const { storeId } = req.params;
        const data = await ChatService.getStoreConversations(storeId);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAll, getChatRoom, getConversations };