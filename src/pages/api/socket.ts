import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import dbConnect from "../../utils/dbConnect";
import Chat from "../../models/Chat";
import User from "../../models/User";
import GroupChat from "@/src/models/GroupChat";

type NextApiResponseServerIO = NextApiResponse & {
  socket: { server: HTTPServer & { io?: Server } };
};

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!["GET", "POST"].includes(req.method as string)) {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!res.socket.server.io) {
      console.log("✅ Socket.IO server initializing...");
      const io = new Server(res.socket.server, {
        path: "/api/socket",
        addTrailingSlash: false,
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "POST"],
          credentials: true,
        },
      });
      res.socket.server.io = io;

      io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        // Handle joining a whiteboard room
        socket.on("joinWhiteboard", (groupId: string) => {
          if (!groupId) {
            console.error("No groupId provided for joinWhiteboard");
            socket.emit("error", { message: "Group ID is required" });
            return;
          }
          console.log(`User joined whiteboard: ${groupId}`);
          socket.join(`whiteboard-${groupId}`);
          socket.emit("joinedWhiteboard", { groupId }); // Confirm join to client
        });

        // Handle draw events
        socket.on("draw", ({ groupId, ...drawData }: { groupId: string }) => {
          if (!groupId) {
            console.error("No groupId provided for draw");
            socket.emit("error", { message: "Group ID is required" });
            return;
          }
          console.log(`Draw event received for group ${groupId}:`, drawData);
          io.to(`whiteboard-${groupId}`).emit("draw", drawData);
        });

        // Handle clear events
        socket.on("clear", (groupId: string) => {
          if (!groupId) {
            console.error("No groupId provided for clear");
            socket.emit("error", { message: "Group ID is required" });
            return;
          }
          console.log(`Clear event received for group ${groupId}`);
          io.to(`whiteboard-${groupId}`).emit("clear");
        });

        // Existing chat-related handlers
        socket.on("joinChat", (chatId: string) => {
          console.log(`User joined chat: ${chatId}`);
          socket.join(chatId);
        });

        socket.on("sendMessage", async ({ chatId, userId, content }: { chatId: string; userId: string; content: string }) => {
          try {
            console.log(`Processing sendMessage: chatId=${chatId}, userId=${userId}, content=${content}`);
            await dbConnect();
            const chat = await Chat.findById(chatId);
            if (!chat) {
              console.error(`Chat not found: ${chatId}`);
              socket.emit("error", { message: `Chat not found: ${chatId}` });
              return;
            }

            const user = await User.findById(userId).select("name");
            if (!user) {
              console.error(`User not found: ${userId}`);
              socket.emit("error", { message: `User not found: ${userId}` });
              return;
            }

            const message = {
              senderId: { _id: userId, name: user.name || "Anonymous" },
              content,
              timestamp: new Date(),
            };
            chat.messages.push({ senderId: userId, content, timestamp: new Date() });
            await chat.save();
            console.log(`Message saved in chat ${chatId}: ${content}`);
            io.to(chatId).emit("message", message);
          } catch (err) {
            console.error("Error saving message:", err);
            socket.emit("error", { message: "Failed to save message" });
          }
        });

        socket.on("joinRoom", (groupId: string) => {
          console.log(`User joined group chat: ${groupId}`);
          socket.join(`group-${groupId}`);
        });

        socket.on("chatMessage", async ({ roomId, message, sender }: { roomId: string; message: string; sender: string }) => {
          try {
            console.log(`Processing chatMessage: roomId=${roomId}, sender=${sender}, message=${message}`);
            await dbConnect();
            let groupChat = await GroupChat.findOne({ groupId: roomId });
            if (!groupChat) {
              groupChat = new GroupChat({ groupId: roomId, messages: [], name: "Unnamed Group", creatorId: sender });
              await groupChat.save();
            }
            const newMessage = { sender, content: message, timestamp: new Date() };
            groupChat.messages.push(newMessage);
            await groupChat.save();
            console.log(`Message saved in group chat ${roomId}: ${message}`);
            io.to(`group-${roomId}`).emit("chatMessage", newMessage);
          } catch (err) {
            console.error("Error saving group message:", err);
            socket.emit("error", { message: "Failed to save group message" });
          }
        });

        socket.on("disconnect", () => {
          console.log("🔴 Client disconnected:", socket.id);
        });
      });

      console.log("Socket.IO server initialized successfully");
    } else {
      console.log("ℹ️ Socket.IO server already initialized");
    }

    res.status(200).end();
  } catch (err) {
    console.error("Error initializing Socket.IO:", err);
    res.status(500).json({ error: "Server error" });
  }
}