import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";

const toTime = (value) => {
    if (!value) return 0;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return startOfDay(result);
};

const parseDate = (value) => {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinRange = (value, start, end) => {
    const date = parseDate(value);
    if (!date || !start || !end) return false;

    return date.getTime() >= start.getTime() && date.getTime() < end.getTime();
};

const createMonthlyBuckets = (months) => {
    const buckets = [];
    const now = new Date();

    for (let offset = months - 1; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        buckets.push({
            label: date.toLocaleDateString("en-IN", { month: "short" }),
            date,
            value: 0
        });
    }

    return buckets;
};

const createDailyBuckets = (days) => {
    const buckets = [];
    const now = startOfDay(new Date());

    for (let offset = days - 1; offset >= 0; offset -= 1) {
        const date = addDays(now, -offset);
        buckets.push({
            label: date.toLocaleDateString("en-IN", { weekday: "short" }),
            date,
            value: 0
        });
    }

    return buckets;
};

const getMonthlyBucketIndex = (buckets, date) => {
    return buckets.findIndex((bucket) => (
        bucket.date.getFullYear() === date.getFullYear()
        && bucket.date.getMonth() === date.getMonth()
    ));
};

const isAdminUser = (user) => {
    const roles = Array.isArray(user.role) ? user.role : [user.role];
    return roles.some((role) => String(role || "").toLowerCase() === "admin");
};

const isPendingOrder = (order) => {
    const status = String(order.orderStatus || "").toLowerCase();
    const paymentStatus = String(order.paymentInfo?.status || "").toLowerCase();
    return status === "processing" || status === "pending" || paymentStatus === "pending";
};

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Important: Check Whether admin should not delete himself.
    if (user._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot delete your own admin account");
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const skip = (page - 1) * limit;

    
    const users = await User.find()
        .select("-password -refreshToken")
        .sort("-createdAt") // New users pehle dikhein
        .skip(skip)
        .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                totalUsers,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        }, "Users fetched with pagination")
    );
});

const getDashboardAnalytics = asyncHandler(async (req, res) => {
    const [orders, users] = await Promise.all([
        Order.find().populate("user", "fullName email username role createdAt").sort("-createdAt"),
        User.find().select("-password -refreshToken").sort("-createdAt")
    ]);

    const customerUsers = users.filter((user) => !isAdminUser(user));
    const now = new Date();
    const thirtyDaysAgo = addDays(now, -30);
    const sixtyDaysAgo = addDays(now, -60);

    const revenueLast30 = orders
        .filter((order) => isWithinRange(order.createdAt, thirtyDaysAgo, now))
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const revenuePrevious30 = orders
        .filter((order) => isWithinRange(order.createdAt, sixtyDaysAgo, thirtyDaysAgo))
        .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    const ordersLast30 = orders.filter((order) => isWithinRange(order.createdAt, thirtyDaysAgo, now)).length;
    const ordersPrevious30 = orders.filter((order) => isWithinRange(order.createdAt, sixtyDaysAgo, thirtyDaysAgo)).length;

    const customersLast30 = customerUsers.filter((user) => isWithinRange(user.createdAt, thirtyDaysAgo, now)).length;
    const customersPrevious30 = customerUsers.filter((user) => isWithinRange(user.createdAt, sixtyDaysAgo, thirtyDaysAgo)).length;

    const monthlyRevenueBuckets = createMonthlyBuckets(6);
    const dailyRevenueBuckets = createDailyBuckets(7);
    const dailyOrdersBuckets = createDailyBuckets(7);
    const customerGrowthBuckets = createMonthlyBuckets(6);

    for (const order of orders) {
        const date = parseDate(order.createdAt);
        if (!date) continue;

        const monthlyBucketIndex = getMonthlyBucketIndex(monthlyRevenueBuckets, date);
        if (monthlyBucketIndex !== -1) {
            monthlyRevenueBuckets[monthlyBucketIndex].value += Number(order.totalAmount || 0);
        }

        const dailyRevenueBucket = dailyRevenueBuckets.find((bucket) => bucket.date.getTime() === startOfDay(date).getTime());
        if (dailyRevenueBucket) {
            dailyRevenueBucket.value += Number(order.totalAmount || 0);
        }

        const dailyOrdersBucket = dailyOrdersBuckets.find((bucket) => bucket.date.getTime() === startOfDay(date).getTime());
        if (dailyOrdersBucket) {
            dailyOrdersBucket.value += 1;
        }
    }

    for (const user of customerUsers) {
        const date = parseDate(user.createdAt);
        if (!date) continue;

        const bucketIndex = getMonthlyBucketIndex(customerGrowthBuckets, date);
        if (bucketIndex !== -1) {
            customerGrowthBuckets[bucketIndex].value += 1;
        }
    }

    return res.status(200).json(
        new ApiResponse(200, {
            summary: {
                totalRevenue: orders.reduce((sum, order) => (
                    order.paymentInfo?.status === "Paid" ? sum + Number(order.totalAmount || 0) : sum
                ), 0),
                totalOrders: orders.length,
                pendingOrders: orders.filter((order) => isPendingOrder(order)).length,
                deliveredOrders: orders.filter((order) => order.orderStatus === "Delivered").length,
                cancelledOrders: orders.filter((order) => order.orderStatus === "Cancelled").length,
                totalCustomers: customerUsers.length,
                newCustomers: customersLast30,
                returningCustomers: customerUsers.filter((user) => {
                    const count = orders.filter((order) => {
                        if (!order.user || typeof order.user !== "object") return false;
                        return String(order.user._id || "") === String(user._id || "");
                    }).length;
                    return count > 1;
                }).length,
                revenueLast30,
                revenuePrevious30,
                ordersLast30,
                ordersPrevious30,
                customersLast30,
                customersPrevious30
            },
            charts: {
                salesOverview: {
                    labels: monthlyRevenueBuckets.map((bucket) => bucket.label),
                    data: monthlyRevenueBuckets.map((bucket) => bucket.value)
                },
                revenueTrend: {
                    labels: dailyRevenueBuckets.map((bucket) => bucket.label),
                    data: dailyRevenueBuckets.map((bucket) => bucket.value)
                },
                ordersTrend: {
                    labels: dailyOrdersBuckets.map((bucket) => bucket.label),
                    data: dailyOrdersBuckets.map((bucket) => bucket.value)
                },
                customerGrowth: {
                    labels: customerGrowthBuckets.map((bucket) => bucket.label),
                    data: customerGrowthBuckets.map((bucket) => bucket.value)
                }
            }
        }, "Dashboard analytics fetched successfully")
    );
});


export {
    deleteUser,
    getAllUsers,
    getDashboardAnalytics
}
