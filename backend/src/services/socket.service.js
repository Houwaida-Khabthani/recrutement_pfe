const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const config = require("../config/env");

let io = null;

exports.initialize = (server) => {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (token) {
      try {
        const payload = jwt.verify(token, config.JWT_SECRET);
        if (payload?.id_user) {
          const room = `user_${payload.id_user}`;
          socket.join(room);
          console.log(`[Socket.io] User ${payload.id_user} joined room ${room}`);
        }
      } catch (error) {
        console.warn("[Socket.io] Invalid token on connection:", error.message);
      }
    } else {
      console.log("[Socket.io] Connection without token, socket id:", socket.id);
    }

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] Disconnected ${socket.id} (${reason})`);
    });
  });

  return io;
};

exports.getIo = () => io;

exports.emitToUser = (userId, event, payload) => {
  if (!io || !userId) return;
  io.to(`user_${userId}`).emit(event, payload);
};
