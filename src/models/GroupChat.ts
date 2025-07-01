import mongoose from "mongoose";

const GroupChatSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  messages: [
    {
      sender: String, // Email or name of the sender
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.models.GroupChat || mongoose.model("GroupChat", GroupChatSchema);