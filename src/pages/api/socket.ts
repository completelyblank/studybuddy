import { NextApiRequest } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Socket.IO upgrade placeholder – for example with server.js or custom Express handler
export default async function handler(req: NextApiRequest, res: any) {
  res.status(426).json({ message: "Please connect via WebSocket, not HTTP." });
}
