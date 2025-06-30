// src/models/Messages.ts (example)
import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  roomId: string;
  message: string;
  sender: string;
  timestamp?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
