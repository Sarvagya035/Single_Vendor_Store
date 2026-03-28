import cron from "node-cron";
import { Order } from "../models/order.model.js";

const cleanupPendingOrders = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const result = await Order.deleteMany({
                "paymentInfo.status": "Pending",
                createdAt: { $lt: twentyFourHoursAgo }
            });

            if (result.deletedCount > 0) {
                console.log(`[Cron Job] Cleaned up ${result.deletedCount} expired pending orders.`);
            }
        } catch (error) {
            console.error("[Cron Job Error]:", error.message);
        }
    });
};

export default cleanupPendingOrders;