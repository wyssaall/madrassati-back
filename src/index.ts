import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = createServer(app);

// Create Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to controllers
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user to their room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.receiverId).emit('typing', {
      senderId: data.senderId,
      isTyping: data.isTyping
    });
  });

  // Handle message sending
  socket.on('sendMessage', async (data) => {
    try {
      // Emit to receiver
      socket.to(data.receiverId).emit('newMessage', data);
      
      // Emit back to sender for confirmation
      socket.emit('messageSent', data);
    } catch (error) {
      socket.emit('messageError', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO server ready`);
});
