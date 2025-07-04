import mongoose, { Schema } from "mongoose";

const GroupChatSchema = new Schema({
  groupId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  creatorId: { type: String, required: true },
  members: [{ type: String }], // Array of user IDs
  messages: [
    {
      sender: { type: String }, // User ID or name
      content: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.models.GroupChat || mongoose.model("GroupChat", GroupChatSchema);