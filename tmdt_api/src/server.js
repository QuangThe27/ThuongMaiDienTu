require('dotenv').config({ quiet: true });
const app = require('./app');
const http = require('http'); // Thêm thư viện http
const { connectDB } = require('./config/database');
const initSocket = require('./config/socket'); // Import socket config

const PORT = process.env.PORT || 3000;
const server = http.createServer(app); // Tạo server từ app

// Khởi tạo Socket
initSocket(server);

async function startServer() {
    await connectDB();

    server.listen(PORT, () => {
        console.log(`Server chạy tại http://localhost:${PORT}`);
    });
}

startServer();