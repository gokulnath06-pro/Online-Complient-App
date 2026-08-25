import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';

// @desc    Get complete analytics dashboard data for Admin
// @route   GET /api/analytics/dashboard
// @access  Private (ADMIN only)
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Overall ticket counts
    const totalComplaints = await Complaint.countDocuments();
    const pendingCount = await Complaint.countDocuments({ status: 'Pending' });
    const assignedCount = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgressCount = await Complaint.countDocuments({ status: 'In Progress' });
    const resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });
    const rejectedCount = await Complaint.countDocuments({ status: 'Rejected' });

    const resolutionRate =
      totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

    // 2. Average Resolution Time calculation
    const resolvedTickets = await Complaint.find({
      status: 'Resolved',
      resolvedAt: { $ne: null },
    });

    let totalResolutionHours = 0;
    resolvedTickets.forEach((ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const resolved = new Date(ticket.resolvedAt).getTime();
      const diffHours = (resolved - created) / (1000 * 60 * 60);
      if (diffHours > 0) totalResolutionHours += diffHours;
    });

    const avgResolutionHours =
      resolvedTickets.length > 0
        ? (totalResolutionHours / resolvedTickets.length).toFixed(1)
        : '0.0';

    // 3. Category Breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 4. Priority Breakdown
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 5. Customer Satisfaction Score
    const feedbackList = await Feedback.find();
    const totalFeedbacks = feedbackList.length;
    const avgSatisfactionRating =
      totalFeedbacks > 0
        ? (feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalFeedbacks).toFixed(1)
        : '5.0';

    // 6. Agent Performance Leaderboard
    const agents = await User.find({ role: 'AGENT' }).select('name email avatar department');
    const agentLeaderboard = await Promise.all(
      agents.map(async (agent) => {
        const assigned = await Complaint.countDocuments({ assignedAgent: agent._id });
        const resolved = await Complaint.countDocuments({
          assignedAgent: agent._id,
          status: 'Resolved',
        });
        const inProgress = await Complaint.countDocuments({
          assignedAgent: agent._id,
          status: 'In Progress',
        });
        const feedbacks = await Feedback.find({ agent: agent._id });
        const avgRating =
          feedbacks.length > 0
            ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1)
            : '5.0';

        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          avatar: agent.avatar,
          department: agent.department,
          assigned,
          resolved,
          inProgress,
          rate: assigned > 0 ? Math.round((resolved / assigned) * 100) : 0,
          avgRating: Number(avgRating),
        };
      })
    );

    // 7. Last 7 Days Activity Trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const complaintsFiled = await Complaint.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });
      const complaintsResolved = await Complaint.countDocuments({
        resolvedAt: { $gte: startOfDay, $lte: endOfDay },
      });

      last7Days.push({
        date: dayStr,
        filed: complaintsFiled,
        resolved: complaintsResolved,
      });
    }

    // 8. Recent Complaints Feed
    const recentComplaints = await Complaint.find()
      .populate('user', 'name avatar')
      .populate('assignedAgent', 'name department')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      metrics: {
        totalComplaints,
        pendingCount,
        assignedCount,
        inProgressCount,
        resolvedCount,
        rejectedCount,
        resolutionRate,
        avgResolutionHours: Number(avgResolutionHours),
        avgSatisfactionRating: Number(avgSatisfactionRating),
        totalFeedbacks,
      },
      categoryStats,
      priorityStats,
      agentLeaderboard,
      weeklyTrends: last7Days,
      recentComplaints,
    });
  } catch (err) {
    next(err);
  }
};
