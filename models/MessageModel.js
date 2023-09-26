import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    receiverId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    messageType: {
      type: String,
      enum: ['text', 'image'],
    },
    message: String,
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
