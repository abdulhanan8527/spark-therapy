const QuarterlyReport = require('../models/QuarterlyReport');
const Child = require('../models/Child');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Create a new quarterly report
const createReport = async (req, res) => {
  try {
    const { childId, period, progressSummary, goalsAchieved, areasForImprovement, recommendations, nextSteps } = req.body;

    console.log('Creating quarterly report:', { childId, period, therapistId: req.user._id });

    // Validate child exists
    const child = await Child.findById(childId);
    if (!child) {
      return errorResponse(res, 'Child not found', 404);
    }

    // Check if therapist is assigned to this child
    if (req.user.role === 'therapist') {
      const therapistIdString = child.therapistId ? child.therapistId.toString() : null;
      if (!therapistIdString || therapistIdString !== req.user._id.toString()) {
        console.log('Authorization failed:', { childTherapist: therapistIdString, requestingTherapist: req.user._id.toString() });
        return errorResponse(res, 'You are not assigned to this child', 403);
      }
    }

    // Check for duplicate report (same child + period)
    const existingReport = await QuarterlyReport.findOne({ childId, period });
    if (existingReport) {
      return errorResponse(res, 'A report for this child and period already exists', 400);
    }

    const report = await QuarterlyReport.create({
      childId,
      therapistId: req.user._id,
      period,
      progressSummary,
      goalsAchieved: goalsAchieved || '',
      areasForImprovement: areasForImprovement || '',
      recommendations: recommendations || '',
      nextSteps: nextSteps || '',
      status: 'pending'
    });

    // Populate child and therapist details
    await report.populate('childId', 'firstName lastName');
    await report.populate('therapistId', 'name email');

    console.log('Quarterly report created successfully:', report._id);
    successResponse(res, report, 'Quarterly report submitted successfully', 201);
  } catch (error) {
    console.error('Create report error:', error);
    errorResponse(res, error.message, 400);
  }
};

// Get reports by therapist
const getReportsByTherapist = async (req, res) => {
  try {
    const therapistId = req.params.therapistId || req.user._id;

    console.log('Fetching reports for therapist:', therapistId);

    // Authorization check
    if (req.user.role === 'therapist' && req.user._id.toString() !== therapistId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    const reports = await QuarterlyReport.find({ therapistId })
      .populate('childId', 'firstName lastName dateOfBirth diagnosis')
      .populate('therapistId', 'name email')
      .sort({ submittedDate: -1 });

    console.log(`Found ${reports.length} reports for therapist`);
    successResponse(res, reports, 'Reports retrieved successfully');
  } catch (error) {
    console.error('Get therapist reports error:', error);
    errorResponse(res, error.message, 400);
  }
};

// Get reports by child
const getReportsByChild = async (req, res) => {
  try {
    const { childId } = req.params;

    console.log('Fetching reports for child:', childId);

    // Validate child exists
    const child = await Child.findById(childId);
    if (!child) {
      return errorResponse(res, 'Child not found', 404);
    }

    // Authorization check
    if (req.user.role === 'parent' && child.parentId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. This is not your child', 403);
    }

    if (req.user.role === 'therapist') {
      const therapistIdString = child.therapistId ? child.therapistId.toString() : null;
      if (!therapistIdString || therapistIdString !== req.user._id.toString()) {
        return errorResponse(res, 'Access denied. You are not assigned to this child', 403);
      }
    }

    const reports = await QuarterlyReport.find({ childId })
      .populate('therapistId', 'name email specialization')
      .sort({ submittedDate: -1 });

    console.log(`Found ${reports.length} reports for child`);
    successResponse(res, reports, 'Reports retrieved successfully');
  } catch (error) {
    console.error('Get child reports error:', error);
    errorResponse(res, error.message, 400);
  }
};

// Get single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Fetching report:', id);

    const report = await QuarterlyReport.findById(id)
      .populate('childId', 'firstName lastName dateOfBirth diagnosis')
      .populate('therapistId', 'name email specialization');

    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    // Authorization check
    const child = report.childId;
    if (req.user.role === 'parent' && child.parentId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    if (req.user.role === 'therapist' && report.therapistId._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    successResponse(res, report, 'Report retrieved successfully');
  } catch (error) {
    console.error('Get report error:', error);
    errorResponse(res, error.message, 400);
  }
};

// Update report (therapist only)
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { progressSummary, goalsAchieved, areasForImprovement, recommendations, nextSteps } = req.body;

    console.log('Updating report:', id);

    const report = await QuarterlyReport.findById(id);
    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    // Only the therapist who created can update
    if (req.user.role === 'therapist' && report.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied. You did not create this report', 403);
    }

    // Only allow updates if status is pending
    if (report.status !== 'pending') {
      return errorResponse(res, 'Cannot update reviewed or approved reports', 400);
    }

    // Update fields
    if (progressSummary) report.progressSummary = progressSummary;
    if (goalsAchieved !== undefined) report.goalsAchieved = goalsAchieved;
    if (areasForImprovement !== undefined) report.areasForImprovement = areasForImprovement;
    if (recommendations !== undefined) report.recommendations = recommendations;
    if (nextSteps !== undefined) report.nextSteps = nextSteps;

    await report.save();

    await report.populate('childId', 'firstName lastName');
    await report.populate('therapistId', 'name email');

    console.log('Report updated successfully');
    successResponse(res, report, 'Report updated successfully');
  } catch (error) {
    console.error('Update report error:', error);
    errorResponse(res, error.message, 400);
  }
};

// Delete report (therapist only, pending reports only)
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting report:', id);

    const report = await QuarterlyReport.findById(id);
    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    // Only the therapist who created can delete
    if (req.user.role === 'therapist' && report.therapistId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Only allow deletion if status is pending
    if (report.status !== 'pending') {
      return errorResponse(res, 'Cannot delete reviewed or approved reports', 400);
    }

    await report.deleteOne();

    console.log('Report deleted successfully');
    successResponse(res, null, 'Report deleted successfully');
  } catch (error) {
    console.error('Delete report error:', error);
    errorResponse(res, error.message, 400);
  }
};

// Update report status (admin only)
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Updating report status:', id, status);

    if (!['pending', 'reviewed', 'approved'].includes(status)) {
      return errorResponse(res, 'Invalid status', 400);
    }

    const report = await QuarterlyReport.findById(id);
    if (!report) {
      return errorResponse(res, 'Report not found', 404);
    }

    report.status = status;
    if (status === 'reviewed' || status === 'approved') {
      report.reviewedDate = new Date();
    }

    await report.save();

    await report.populate('childId', 'firstName lastName');
    await report.populate('therapistId', 'name email');

    console.log('Report status updated successfully');
    successResponse(res, report, 'Report status updated successfully');
  } catch (error) {
    console.error('Update report status error:', error);
    errorResponse(res, error.message, 400);
  }
};

module.exports = {
  createReport,
  getReportsByTherapist,
  getReportsByChild,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus
};
