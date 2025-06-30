import { Server } from "socket.io";
import type { NextApiRequest } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log("✅ Socket.IO server initializing...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("🟢 Client connected");

      socket.on("draw", (data) => {
        socket.broadcast.emit("draw", data);
      });

      socket.on("clear", () => {
        socket.broadcast.emit("clear");
      });
    });
  }
  res.end();
}
