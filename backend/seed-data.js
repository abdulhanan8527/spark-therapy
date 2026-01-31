const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' }); // Load local environment if available

// Import all model files
const User = require('./models/User');
const Child = require('./models/Child');
const Program = require('./models/Program');
const Session = require('./models/Session');
const Invoice = require('./models/Invoice');
const Notification = require('./models/Notification');
const Complaint = require('./models/Complaint');
const Fee = require('./models/Fee');
const Schedule = require('./models/Schedule');
const LeaveRequest = require('./models/LeaveRequest');
const Feedback = require('./models/Feedback');

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB with fallback options
    const dbUri = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/spark_therapy';
    await mongoose.connect(dbUri);
    
    console.log('Connected to MongoDB successfully!');
    
    // Clear existing data (optional - comment out if you don't want to clear)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Child.deleteMany({});
    await Program.deleteMany({});
    await Session.deleteMany({});
    await Invoice.deleteMany({});
    await Notification.deleteMany({});
    await Complaint.deleteMany({});
    await Fee.deleteMany({});
    await Schedule.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Existing data cleared!');
    
    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@sparktherapy.com',
      password: adminPassword,
      role: 'admin'
    });
    await adminUser.save();
    console.log('✓ Admin user created');
    
    // Create therapist user
    console.log('Creating therapist user...');
    const therapistPassword = await bcrypt.hash('therapist123', 10);
    const therapistUser = new User({
      name: 'Jane Smith',
      email: 'therapist@sparktherapy.com',
      password: therapistPassword,
      role: 'therapist'
    });
    await therapistUser.save();
    console.log('✓ Therapist user created');
    
    // Create parent user
    console.log('Creating parent user...');
    const parentPassword = await bcrypt.hash('parent123', 10);
    const parentUser = new User({
      name: 'John Doe',
      email: 'parent@sparktherapy.com',
      password: parentPassword,
      role: 'parent'
    });
    await parentUser.save();
    console.log('✓ Parent user created');
    
    // Create a child
    console.log('Creating child...');
    const child = new Child({
      firstName: 'Emma',
      lastName: 'Doe',
      dateOfBirth: new Date('2018-05-15'),
      gender: 'female',
      parentId: parentUser._id,
      therapistId: therapistUser._id,
      diagnosis: 'Autism Spectrum Disorder',
      notes: 'Loves drawing and music therapy'
    });
    await child.save();
    console.log('✓ Child created');
    
    // Create a program
    console.log('Creating program...');
    const program = new Program({
      childId: child._id,
      title: 'Communication Skills',
      abllsCode: 'ABLLS-R-001',
      category: 'Communication',
      shortDescription: 'Developing basic communication skills',
      longDescription: 'Program to help develop basic communication and language skills',
      masteryCriteria: '80% accuracy across 3 consecutive sessions',
      dataCollectionMethod: 'frequency',
      targets: [
        {
          description: 'Requesting preferred items',
          isMastered: false
        },
        {
          description: 'Following simple instructions',
          isMastered: false
        }
      ]
    });
    await program.save();
    console.log('✓ Program created');
    
    // Create a session
    console.log('Creating session...');
    const session = new Session({
      therapistId: therapistUser._id,
      childId: child._id,
      parentId: parentUser._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60000), // 1 hour later
      duration: 60,
      status: 'completed',
      notes: 'Session went well, child showed improvement in communication'
    });
    await session.save();
    console.log('✓ Session created');
    
    // Create an invoice
    console.log('Creating invoice...');
    const invoice = new Invoice({
      parentId: parentUser._id,
      childId: child._id,
      amount: 120.00,
      description: 'Monthly therapy sessions',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60000), // 30 days from now
      status: 'pending',
      invoiceNumber: 'INV-001'
    });
    await invoice.save();
    console.log('✓ Invoice created');
    
    // Create a notification
    console.log('Creating notification...');
    const notification = new Notification({
      recipientId: parentUser._id,
      senderId: adminUser._id,
      title: 'Welcome to SPARK Therapy',
      message: 'Welcome to our therapy platform. Your child Emma has been enrolled in our communication skills program.',
      type: 'info',
      priority: 'normal'
    });
    await notification.save();
    console.log('✓ Notification created');
    
    // Create a complaint
    console.log('Creating complaint...');
    const complaint = new Complaint({
      parentId: parentUser._id,
      childId: child._id,
      subject: 'Late Session Notification',
      description: 'Received notification about session cancellation too late',
      status: 'pending',
      priority: 'medium',
      category: 'service'
    });
    await complaint.save();
    console.log('✓ Complaint created');
    
    // Create a fee
    console.log('Creating fee...');
    const fee = new Fee({
      parentId: parentUser._id,
      childId: child._id,
      amount: 75.00,
      description: 'Assessment fee',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60000), // 15 days from now
      status: 'pending',
      feeType: 'assessment'
    });
    await fee.save();
    console.log('✓ Fee created');
    
    // Create a schedule
    console.log('Creating schedule...');
    const schedule = new Schedule({
      therapistId: therapistUser._id,
      childId: child._id,
      date: new Date(Date.now() + 24 * 60 * 60000), // Tomorrow
      time: '10:00',
      duration: 60,
      sessionType: 'therapy',
      notes: 'Focus on communication skills',
      status: 'scheduled',
      recurring: false
      // Don't set recurrencePattern since recurring is false
    });
    await schedule.save();
    console.log('✓ Schedule created');
    
    // Create a leave request
    console.log('Creating leave request...');
    const leaveRequest = new LeaveRequest({
      therapistId: therapistUser._id,
      leaveType: 'vacation',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60000), // In a week
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60000), // In two weeks
      reason: 'Family vacation'
    });
    await leaveRequest.save();
    console.log('✓ Leave request created');
    
    // Create feedback
    console.log('Creating feedback...');
    const feedback = new Feedback({
      childId: child._id,
      therapistId: therapistUser._id,
      parentId: parentUser._id,
      date: new Date(),
      mood: 'happy',
      activities: ['Drawing', 'Playing with blocks'],
      achievements: ['Followed 3-step instructions', 'Used 5-word sentences'],
      challenges: ['Difficulty with transitions'],
      recommendations: ['Practice transitions with visual cues']
    });
    await feedback.save();
    console.log('✓ Feedback created');
    
    console.log('\nDatabase seeding completed successfully!');
    console.log('Created sample data for all collections');
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };