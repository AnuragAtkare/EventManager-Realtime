const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');

const socketHandler = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔗 Socket connected: ${socket.id} | User: ${socket.userId}`);

    // Join event room
    socket.on('join_event', (eventId) => {
      if (!eventId) return;
      socket.join(`event:${eventId}`);
      console.log(`👤 User ${socket.userId} joined event room: ${eventId}`);
    });

    // Join specific chat room (committee or head_subhead)
    socket.on('join_chat_room', ({ eventId, chatType, committeeId }) => {
      let room = `chat:${eventId}:${chatType}`;
      if (committeeId) room += `:${committeeId}`;
      socket.join(room);
    });

    // Send message via socket
    socket.on('send_message', async ({ eventId, chatType, committeeId, message }) => {
      try {
        if (!eventId || !chatType || !message) return;

        const chatMessage = new ChatMessage({
          eventId,
          chatType,
          committeeId: committeeId || null,
          sender: socket.userId,
          message,
        });

        await chatMessage.save();
        await chatMessage.populate('sender', 'name email avatar');

        let room = `chat:${eventId}:${chatType}`;
        if (committeeId) room += `:${committeeId}`;

        // Emit to the specific chat room
        io.to(room).emit('new_message', {
          ...chatMessage.toObject(),
          _id: chatMessage._id.toString(),
        });

        // Also emit to the event room for notification badge updates
        io.to(`event:${eventId}`).emit('chat_notification', {
          chatType,
          committeeId,
          eventId,
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ eventId, chatType, committeeId, isTyping }) => {
      let room = `chat:${eventId}:${chatType}`;
      if (committeeId) room += `:${committeeId}`;

      socket.to(room).emit('user_typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // Announcement broadcast (Head sends)
    socket.on('broadcast_announcement', (announcement) => {
      if (!announcement?.eventId) return;
      io.to(`event:${announcement.eventId}`).emit('new_announcement', announcement);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
