import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';

// @desc    Submit feedback/rating for a resolved complaint
// @route   POST /api/feedback/:complaintId
// @access  Private (USER only)
export const submitFeedback = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { rating, speedRating, serviceRating, comment, tags } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Only ticket creator can leave feedback
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the user who raised the complaint can submit feedback',
      });
    }

    // Check if complaint is resolved
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted after the complaint has been marked as Resolved',
      });
    }

    // Check if feedback already submitted
    const existing = await Feedback.findOne({ complaint: complaintId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this complaint',
      });
    }

    const feedback = await Feedback.create({
      complaint: complaintId,
      user: req.user._id,
      agent: complaint.assignedAgent,
      rating: Number(rating),
      speedRating: speedRating ? Number(speedRating) : 5,
      serviceRating: serviceRating ? Number(serviceRating) : 5,
      comment: comment || '',
      tags: tags || [],
    });

    const populated = await Feedback.findById(feedback._id)
      .populate('user', 'name email avatar')
      .populate('agent', 'name department');

    res.status(201).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded.',
      feedback: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get feedback for a specific complaint
// @route   GET /api/feedback/complaint/:complaintId
// @access  Public / Private
export const getComplaintFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({
      complaint: req.params.complaintId,
    })
      .populate('user', 'name avatar')
      .populate('agent', 'name department');

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all feedback submissions with aggregate ratings
// @route   GET /api/feedback
// @access  Private (ADMIN & AGENT)
export const getAllFeedback = async (req, res, next) => {
  try {
    const { agentId } = req.query;
    const query = {};
    if (agentId) query.agent = agentId;

    const feedbackList = await Feedback.find(query)
      .populate('user', 'name email avatar')
      .populate('agent', 'name department email')
      .populate('complaint', 'ticketId title category')
      .sort({ createdAt: -1 });

    const totalCount = feedbackList.length;
    const avgRating =
      totalCount > 0
        ? (feedbackList.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      count: totalCount,
      avgRating: Number(avgRating),
      feedbacks: feedbackList,
    });
  } catch (err) {
    next(err);
  }
};
