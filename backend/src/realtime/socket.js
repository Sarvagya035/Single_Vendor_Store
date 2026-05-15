import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";
import { createOriginChecker } from "../utils/origin.js";

let io = null;

const normalizeRoles = (roles) => {
    const list = Array.isArray(roles) ? roles : roles ? [roles] : [];
    return [...new Set(list.map((role) => String(role || "").trim().toLowerCase()).filter(Boolean))];
};

const joinRoomsForUser = async (socket, userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    const roles = normalizeRoles(user.role);

    socket.join(`user:${user._id}`);

    for (const role of roles) {
        socket.join(`role:${role}`);
    }

    if (roles.includes("vendor")) {
        const vendor = await Vendor.findOne({ user: user._id }).select("_id");
        if (vendor?._id) {
            socket.join(`vendor:${vendor._id.toString()}`);
            socket.data.vendorId = vendor._id.toString();
        }
    }

    socket.data.user = {
        _id: user._id.toString(),
        role: roles,
        email: user.email,
        username: user.username
    };
};

const initializeRealtime = (httpServer) => {
    if (io) {
        return io;
    }

    io = new Server(httpServer, {
        cors: {
            origin: createOriginChecker(),
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                String(socket.handshake.headers?.authorization || "")
                    .replace(/^Bearer\s+/i, "")
                    .trim();

            if (!token) {
                next(new Error("Authentication token is required."));
                return;
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const userId = decoded?._id;

            if (!userId) {
                next(new Error("Unauthorized socket connection."));
                return;
            }

            const user = await User.findById(userId).select("-password -refreshToken");
            if (!user) {
                next(new Error("Unauthorized socket connection."));
                return;
            }

            socket.data.authenticatedUser = user;
            next();
        } catch (error) {
            next(new Error("Unauthorized socket connection."));
        }
    });

    io.on("connection", async (socket) => {
        try {
            await joinRoomsForUser(socket, socket.data.authenticatedUser);
            socket.emit("realtime:ready", {
                userId: socket.data.user?._id,
                roles: socket.data.user?.role || [],
                vendorId: socket.data.vendorId || null
            });
        } catch (error) {
            socket.disconnect(true);
        }
    });

    return io;
};

const getSocketServer = () => io;

const emitToRoom = (room, event, payload) => {
    if (!io || !room || !event) {
        return false;
    }

    io.to(room).emit(event, payload);
    return true;
};

const emitToUser = (userId, event, payload) => emitToRoom(`user:${userId}`, event, payload);

const emitToRole = (role, event, payload) =>
    emitToRoom(`role:${String(role || "").trim().toLowerCase()}`, event, payload);

const emitToVendor = (vendorId, event, payload) => emitToRoom(`vendor:${vendorId}`, event, payload);

export {
    emitToRole,
    emitToRoom,
    emitToUser,
    emitToVendor,
    getSocketServer,
    initializeRealtime
};
