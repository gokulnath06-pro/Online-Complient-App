import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the complaint'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Billing', 'Service', 'Hardware', 'Product', 'Other'],
      default: 'Technical',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    timeline: [timelineEventSchema],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast query performance
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ user: 1, status: 1 });
complaintSchema.index({ assignedAgent: 1, status: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
