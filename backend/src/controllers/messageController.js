import Message from '../models/Message.js';
import Complaint from '../models/Complaint.js';

// @desc    Get messages for a specific complaint ticket
// @route   GET /api/messages/:complaintId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    // Check if complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Access check: User must be complaint creator, assigned agent, or admin
    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAssignedAgent =
      complaint.assignedAgent &&
      complaint.assignedAgent.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages for this ticket',
      });
    }

    const messages = await Message.find({ complaintId })
      .populate('sender', 'name email avatar role department')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message in a complaint ticket conversation
// @route   POST /api/messages/:complaintId
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content cannot be empty',
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Access check
    const isOwner = complaint.user.toString() === req.user._id.toString();
    const isAssignedAgent =
      complaint.assignedAgent &&
      complaint.assignedAgent.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages for this ticket',
      });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const newMsg = await Message.create({
      complaintId,
      sender: req.user._id,
      senderRole: req.user.role,
      message,
      attachments,
    });

    const populated = await Message.findById(newMsg._id).populate(
      'sender',
      'name email avatar role department'
    );

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (err) {
    next(err);
  }
};
