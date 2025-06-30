import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import mongoose from 'mongoose';
import Message from './src/models/Messages'; // ✅ TS import works
require("dotenv").config({ path: ".env" });

mongoose.connect(process.env.MONGODB_URI!, {
})
  .then(() => console.log("✅ MongoDB connected, ", process.env.MONGODB_URI))
  .catch((err) => console.error("❌ MongoDB error:", err));

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);

  const io = new Server(server, {
    path: '/socket.io',
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
    });

    socket.on('chatMessage', async ({ roomId, message, sender }) => {
      io.to(roomId).emit('chatMessage', { message, sender });

      try {
        await Message.create({ roomId, message, sender });
      } catch (err) {
        console.error('❌ Error saving message:', err);
      }
    });
  });

  expressApp.all('*', (req, res) => handle(req, res));

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Ready on http://localhost:${PORT}`);
  });
});
