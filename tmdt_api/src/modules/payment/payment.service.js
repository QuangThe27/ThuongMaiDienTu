const axios = require('axios');
const cron = require('node-cron');
const OrderModel = require('../order/order.model');
const NotificationModel = require('../notification/notification.model');
const { getIO } = require('../../config/socket');

const checkBankTransactions = async () => {
    try {
        // 1. Gọi API ngân hàng
        const response = await axios.get(`${process.env.BANK_URL}${process.env.BANK_TOKEN}`);
        if (response.data.status !== 'success') return;

        const tranList = response.data.TranList;
        // 2. Lấy danh sách đơn hàng đang chờ thanh toán online
        const pendingOrders = await OrderModel.findPendingOnlineOrders();

        for (const order of pendingOrders) {
            // Cú pháp tìm kiếm: "tmdt" + id đơn hàng (ví dụ tmdt8)
            const expectedContent = `tmdt${order.id}`.toLowerCase();

            // 3. Đối soát với danh sách giao dịch từ ngân hàng
            const matchingTran = tranList.find((tran) => {
                const description = tran.description.toLowerCase();
                const amount = parseFloat(tran.creditAmount); // Tiền vào

                return (
                    description.includes(expectedContent) &&
                    amount === parseFloat(order.total_price)
                );
            });

            if (matchingTran) {
                console.log(`--- Đơn hàng #${order.id} đã thanh toán thành công! ---`);

                // 4. Cập nhật DB
                await OrderModel.updatePaymentStatus(order.id);

                // 5. Tạo thông báo trong DB
                await NotificationModel.createNotification({
                    is_user_store: 0,
                    user_id: order.user_id,
                    title: 'Thanh toán thành công',
                    message: `Đơn hàng #${order.id} của bạn đã được thanh toán thành công qua Ngân hàng.`,
                    path: `/thong-tin-don-hang/${order.id}`,
                    status: 0,
                });

                // 6. Bắn Socket Realtime cho User
                const io = getIO();
                io.to(`user_${order.user_id}`).emit('order_payment_success', {
                    orderId: order.id,
                    message: 'Đơn hàng của bạn đã được thanh toán thành công!',
                    totalPrice: order.total_price,
                });
            }
        }
    } catch (error) {
        console.error('Lỗi tự động cập nhật thanh toán:', error.message);
    }
};

// Khởi chạy cron job mỗi 5 giây
const initPaymentCron = () => {
    // '*/5 * * * * *' chạy mỗi 5 giây
    cron.schedule('*/5 * * * * *', () => {
        checkBankTransactions();
    });
    console.log('Hệ thống đối soát ngân hàng tự động đã bắt đầu (5s/lần)');
};

module.exports = { initPaymentCron };
