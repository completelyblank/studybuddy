// models/Chat.js
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);