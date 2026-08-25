import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';

// Helper to generate unique Ticket ID
const generateTicketId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const prefix = 'TKT';
  return `${prefix}-${randomNum}`;
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (USER, AGENT, ADMIN)
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    let ticketId = generateTicketId();
    // Ensure uniqueness
    let existing = await Complaint.findOne({ ticketId });
    while (existing) {
      ticketId = generateTicketId();
      existing = await Complaint.findOne({ ticketId });
    }

    // Process attachments if uploaded
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const complaint = await Complaint.create({
      ticketId,
      title,
      description,
      category: category || 'Technical',
      priority: priority || 'Medium',
      status: 'Pending',
      user: req.user._id,
      attachments,
      timeline: [
        {
          status: 'Pending',
          note: 'Complaint registered in the system.',
          updatedBy: req.user._id,
          timestamp: new Date(),
        },
      ],
    });

    const populated = await Complaint.findById(complaint._id).populate(
      'user',
      'name email avatar department'
    );

    res.status(201).json({
      success: true,
      message: `Complaint submitted successfully with Ticket ID: ${ticketId}`,
      complaint: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user's complaints
// @route   GET /api/complaints/my
// @access  Private
export const getMyComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('assignedAgent', 'name email avatar department phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get agent assigned complaints
// @route   GET /api/complaints/assigned
// @access  Private (AGENT & ADMIN)
export const getAgentComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search } = req.query;
    const query = { assignedAgent: req.user._id };

    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email avatar phone department')
      .populate('assignedAgent', 'name email avatar department')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all complaints (Admin or overview)
// @route   GET /api/complaints
// @access  Private (Admin & Agent)
export const getAllComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search, agentId, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (agentId) query.assignedAgent = agentId;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('user', 'name email avatar department phone')
      .populate('assignedAgent', 'name email avatar department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      complaints,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single complaint by ID or Ticket ID
// @route   GET /api/complaints/:id
// @access  Public / Private (with permission check)
export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if looking up by ticketId or MongoDB _id
    let complaint;
    if (id.startsWith('TKT-')) {
      complaint = await Complaint.findOne({ ticketId: id.toUpperCase() })
        .populate('user', 'name email avatar department')
        .populate('assignedAgent', 'name email avatar department phone')
        .populate('timeline.updatedBy', 'name role');
    } else {
      complaint = await Complaint.findById(id)
        .populate('user', 'name email avatar department')
        .populate('assignedAgent', 'name email avatar department phone')
        .populate('timeline.updatedBy', 'name role');
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint ticket not found',
      });
    }

    // Fetch associated feedback if any
    const feedback = await Feedback.findOne({ complaint: complaint._id }).populate(
      'user',
      'name avatar'
    );

    res.status(200).json({
      success: true,
      complaint,
      feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint status & resolution workflow
// @route   PUT /api/complaints/:id/status
// @access  Private (AGENT & ADMIN)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, resolutionNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Verify agent is assigned or user is admin
    if (
      req.user.role === 'AGENT' &&
      complaint.assignedAgent &&
      complaint.assignedAgent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update status for complaints assigned to you.',
      });
    }

    complaint.status = status;
    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes;
    }
    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
    }

    // Append to timeline
    complaint.timeline.push({
      status,
      note: note || `Status updated to ${status} by ${req.user.name} (${req.user.role}).`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('user', 'name email avatar')
      .populate('assignedAgent', 'name email avatar department')
      .populate('timeline.updatedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Complaint status updated to '${status}'`,
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign an agent to a complaint
// @route   PUT /api/complaints/:id/assign
// @access  Private (ADMIN & AGENT)
export const assignAgent = async (req, res, next) => {
  try {
    const { agentId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'AGENT') {
      return res.status(400).json({
        success: false,
        message: 'Specified user is not a valid active agent.',
      });
    }

    complaint.assignedAgent = agent._id;
    if (complaint.status === 'Pending') {
      complaint.status = 'Assigned';
    }

    complaint.timeline.push({
      status: complaint.status,
      note: `Assigned to agent ${agent.name} (${agent.department}) by ${req.user.name}.`,
      updatedBy: req.user._id,
      timestamp: new Date(),
    });

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('user', 'name email avatar')
      .populate('assignedAgent', 'name email avatar department')
      .populate('timeline.updatedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Complaint assigned to agent ${agent.name} successfully`,
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (ADMIN only, or owner if still Pending)
export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Only Admin can delete any complaint, user can delete only if pending
    if (req.user.role !== 'ADMIN') {
      if (
        complaint.user.toString() !== req.user._id.toString() ||
        complaint.status !== 'Pending'
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this complaint.',
        });
      }
    }

    await Complaint.findByIdAndDelete(req.params.id);
    await Feedback.deleteMany({ complaint: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
