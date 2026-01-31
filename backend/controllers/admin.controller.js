const UserService = require('../services/user.service');
const ChildService = require('../services/child.service');
const TherapistService = require('../services/therapist.service');
const InvoiceService = require('../services/invoice.service');
const ComplaintService = require('../services/complaint.service');
const FeedbackService = require('../services/feedback.service');
const SessionService = require('../services/session.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin only.', 403);
    }

    // Get various statistics in parallel
    const [
      usersResult,
      childrenResult,
      therapistsResult,
      invoicesResult,
      complaintsResult,
      feedbackResult,
      sessionsResult
    ] = await Promise.all([
      UserService.getAllUsers(),
      ChildService.getAllChildren(),
      TherapistService.getAllTherapists(),
      InvoiceService.getAllInvoices(),
      ComplaintService.getAllComplaints(),
      FeedbackService.getAllFeedback(),
      SessionService.getAllSessions()
    ]);

    // Calculate statistics
    const stats = {
      totalUsers: usersResult.success ? usersResult.data.length : 0,
      totalChildren: childrenResult.success ? childrenResult.data.length : 0,
      totalTherapists: therapistsResult.success ? therapistsResult.data.length : 0,
      totalInvoices: invoicesResult.success ? invoicesResult.data.length : 0,
      overdueInvoices: invoicesResult.success 
        ? invoicesResult.data.filter(inv => inv.status.toLowerCase() === 'overdue').length 
        : 0,
      unpaidInvoices: invoicesResult.success 
        ? invoicesResult.data.filter(inv => inv.status.toLowerCase() === 'pending').length 
        : 0,
      totalRevenue: invoicesResult.success 
        ? invoicesResult.data
            .filter(inv => inv.status.toLowerCase() === 'paid')
            .reduce((sum, inv) => sum + (inv.amount || 0), 0)
        : 0,
      activeComplaints: complaintsResult.success 
        ? complaintsResult.data.filter(comp => comp.status.toLowerCase() !== 'resolved').length 
        : 0,
      totalFeedback: feedbackResult.success ? feedbackResult.data.length : 0,
      pendingFeedback: feedbackResult.success 
        ? feedbackResult.data.filter(fb => !fb.completed).length 
        : 0,
      totalSessions: sessionsResult.success ? sessionsResult.data.length : 0,
      upcomingSessions: sessionsResult.success 
        ? sessionsResult.data.filter(sess => new Date(sess.startTime) > new Date()).length 
        : 0,
      recentActivity: []
    };

    // Add recent activity (latest 5 records from various entities)
    const recentActivity = [];

    // Add latest invoices
    if (invoicesResult.success && invoicesResult.data.length > 0) {
      const latestInvoices = invoicesResult.data
        .sort((a, b) => new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp()))
        .slice(0, 2)
        .map(inv => ({
          type: 'invoice',
          title: `Invoice #${inv.invoiceNumber || inv._id}`,
          description: `Created for ${inv.parentName || 'Unknown'}`,
          date: inv.createdAt || inv._id.getTimestamp(),
          status: inv.status
        }));
      recentActivity.push(...latestInvoices);
    }

    // Add latest complaints
    if (complaintsResult.success && complaintsResult.data.length > 0) {
      const latestComplaints = complaintsResult.data
        .sort((a, b) => new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp()))
        .slice(0, 2)
        .map(comp => ({
          type: 'complaint',
          title: comp.subject,
          description: `From ${comp.parentName || 'Unknown'}`,
          date: comp.createdAt || comp._id.getTimestamp(),
          status: comp.status
        }));
      recentActivity.push(...latestComplaints);
    }

    // Add latest feedback
    if (feedbackResult.success && feedbackResult.data.length > 0) {
      const latestFeedback = feedbackResult.data
        .sort((a, b) => new Date(b.createdAt || b._id.getTimestamp()) - new Date(a.createdAt || a._id.getTimestamp()))
        .slice(0, 1)
        .map(fb => ({
          type: 'feedback',
          title: 'New Feedback',
          description: `From ${fb.parentName || 'Unknown'} for ${fb.childName || 'Unknown'}`,
          date: fb.createdAt || fb._id.getTimestamp(),
          status: fb.completed ? 'completed' : 'pending'
        }));
      recentActivity.push(...latestFeedback);
    }

    // Sort recent activity by date (most recent first) and limit to 5
    stats.recentActivity = recentActivity
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    successResponse(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getDashboardStats
};