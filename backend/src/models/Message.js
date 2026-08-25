import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['USER', 'AGENT', 'ADMIN', 'SYSTEM'],
      default: 'USER',
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ complaintId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
