const Joi = require('joi');

// User validation schemas
const userSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('parent', 'therapist', 'admin').default('parent'),
    phone: Joi.string().optional().allow(''),
    specialization: Joi.when('role', {
      is: 'therapist',
      then: Joi.string().optional().allow(''),
      otherwise: Joi.forbidden()
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    phone: Joi.string().optional(),
    specialization: Joi.string().optional()
  })
};

// Child validation schemas
const childSchemas = {
  create: Joi.object({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    parentId: Joi.string().length(24).hex().required(),
    diagnosis: Joi.string().max(500).required(),
    therapistId: Joi.string().length(24).hex().optional(),
    notes: Joi.string().max(1000).optional()
  }),

  update: Joi.object({
    firstName: Joi.string().min(1).max(50),
    lastName: Joi.string().min(1).max(50),
    dateOfBirth: Joi.date(),
    gender: Joi.string().valid('male', 'female', 'other'),
    parentId: Joi.string().length(24).hex(),
    diagnosis: Joi.string().max(500).optional(),
    therapistId: Joi.string().length(24).hex().optional(),
    notes: Joi.string().max(1000).optional(),
    isActive: Joi.boolean()
  })
};

// Program validation schemas
const programSchemas = {
  create: Joi.object({
    childId: Joi.string().required(),
    title: Joi.string().min(1).max(100).required(),
    abllsCode: Joi.string().max(20).optional(),
    category: Joi.string().min(1).max(50).required(),
    shortDescription: Joi.string().max(200).optional(),
    longDescription: Joi.string().max(1000).optional(),
    masteryCriteria: Joi.string().max(500).optional(),
    dataCollectionMethod: Joi.string().valid('frequency', 'duration', 'interval', 'permanent-product').default('frequency')
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(100),
    abllsCode: Joi.string().max(20).optional(),
    category: Joi.string().min(1).max(50),
    shortDescription: Joi.string().max(200).optional(),
    longDescription: Joi.string().max(1000).optional(),
    masteryCriteria: Joi.string().max(500).optional(),
    dataCollectionMethod: Joi.string().valid('frequency', 'duration', 'interval', 'permanent-product'),
    isArchived: Joi.boolean()
  }),

  updateTarget: Joi.object({
    description: Joi.string().min(1).max(200).required(),
    isMastered: Joi.boolean(),
    notes: Joi.string().max(500).optional()
  }),
  
  addTarget: Joi.object({
    description: Joi.string().min(1).max(200).required(),
    isMastered: Joi.boolean().default(false),
    notes: Joi.string().max(500).optional()
  })
};

// Notification validation schemas
const notificationSchemas = {
  create: Joi.object({
    recipientId: Joi.string().optional(),
    recipientType: Joi.string().valid('all', 'parents', 'therapists', 'both').optional(),
    title: Joi.string().min(1).max(100).required(),
    message: Joi.string().min(1).max(500).required(),
    type: Joi.string().valid('info', 'warning', 'success', 'error', 'broadcast').default('info'),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
    isBroadcast: Joi.boolean().optional(),
    scheduledFor: Joi.date().optional()
  }).or('recipientId', 'recipientType') // At least one must be present
};

// Invoice validation schemas
const invoiceSchemas = {
  create: Joi.object({
    childId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    dueDate: Joi.date().required(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('pending', 'paid', 'overdue').default('pending')
  }),

  update: Joi.object({
    amount: Joi.number().positive(),
    dueDate: Joi.date(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('pending', 'paid', 'overdue')
  })
};

// Complaint validation schemas
const complaintSchemas = {
  create: Joi.object({
    childId: Joi.string().required(),
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(1000).required(),
    category: Joi.string().valid('service', 'therapist', 'billing', 'other').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').default('open')
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(100),
    description: Joi.string().min(1).max(1000),
    category: Joi.string().valid('service', 'therapist', 'billing', 'other'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed')
  })
};

// Schedule validation schemas
const scheduleSchemas = {
  create: Joi.object({
    therapistId: Joi.string().required(),
    childId: Joi.string().required(),
    startTime: Joi.date().required(),
    endTime: Joi.date().required(),
    sessionType: Joi.string().valid('assessment', 'therapy', 'consultation', 'meeting').required(),
    recurrencePattern: Joi.string().valid('daily', 'weekly', 'monthly', 'none').default('none'),
    notes: Joi.string().max(500).optional()
  }),

  update: Joi.object({
    therapistId: Joi.string(),
    childId: Joi.string(),
    startTime: Joi.date(),
    endTime: Joi.date(),
    sessionType: Joi.string().valid('assessment', 'therapy', 'consultation', 'meeting'),
    recurrencePattern: Joi.string().valid('daily', 'weekly', 'monthly', 'none'),
    notes: Joi.string().max(500).optional()
  })
};

// Leave request validation schemas
const leaveSchemas = {
  create: Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    reason: Joi.string().min(1).max(500).required(),
    leaveType: Joi.string().valid('vacation', 'sick', 'personal', 'maternity', 'paternity').required(),
    status: Joi.string().valid('pending', 'approved', 'rejected').default('pending')
  }),

  update: Joi.object({
    startDate: Joi.date(),
    endDate: Joi.date(),
    reason: Joi.string().min(1).max(500),
    leaveType: Joi.string().valid('vacation', 'sick', 'personal', 'maternity', 'paternity'),
    status: Joi.string().valid('pending', 'approved', 'rejected')
  })
};

// Therapist validation schemas
const therapistSchemas = {
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    phone: Joi.string().optional().allow(''),
    specialization: Joi.string().optional().allow(''),
    isActive: Joi.boolean()
  })
};

// Fee validation schemas
const feeSchemas = {
  create: Joi.object({
    childId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    dueDate: Joi.date().required(),
    feeType: Joi.string().valid('assessment', 'session', 'consultation', 'materials', 'other').required(),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('pending', 'paid', 'overdue').default('pending')
  }),

  update: Joi.object({
    amount: Joi.number().positive(),
    dueDate: Joi.date(),
    feeType: Joi.string().valid('assessment', 'session', 'consultation', 'materials', 'other'),
    description: Joi.string().max(500).optional(),
    status: Joi.string().valid('pending', 'paid', 'overdue')
  })
};

module.exports = {
  userSchemas,
  childSchemas,
  programSchemas,
  notificationSchemas,
  invoiceSchemas,
  complaintSchemas,
  scheduleSchemas,
  leaveSchemas,
  therapistSchemas,
  feeSchemas
};