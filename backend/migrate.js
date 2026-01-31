const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' }); // Load local environment if available

// Import all model files to ensure collections are registered
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

// Migration functions
const migrations = {
  // Add any specific migration logic here if needed
  // For now, we're just ensuring the collections exist with proper schemas
};

async function runMigrations() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB with fallback options
    const dbUri = process.env.MONGODB_URI || process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/spark_therapy';
    await mongoose.connect(dbUri);
    
    console.log('Connected to MongoDB successfully!');
    
    // Ensure indexes for all collections
    console.log('Ensuring indexes for all collections...');
    
    // Users collection indexes
    await User.syncIndexes();
    console.log('✓ Users indexes created/updated');
    
    // Children collection indexes
    await Child.syncIndexes();
    console.log('✓ Children indexes created/updated');
    
    // Programs collection indexes
    await Program.syncIndexes();
    console.log('✓ Programs indexes created/updated');
    
    // Sessions collection indexes
    await Session.syncIndexes();
    console.log('✓ Sessions indexes created/updated');
    
    // Invoices collection indexes
    await Invoice.syncIndexes();
    console.log('✓ Invoices indexes created/updated');
    
    // Notifications collection indexes
    await Notification.syncIndexes();
    console.log('✓ Notifications indexes created/updated');
    
    // Complaints collection indexes
    await Complaint.syncIndexes();
    console.log('✓ Complaints indexes created/updated');
    
    // Fees collection indexes
    await Fee.syncIndexes();
    console.log('✓ Fees indexes created/updated');
    
    // Schedules collection indexes
    await Schedule.syncIndexes();
    console.log('✓ Schedules indexes created/updated');
    
    // Leave requests collection indexes
    await LeaveRequest.syncIndexes();
    console.log('✓ Leave requests indexes created/updated');
    
    // Feedback collection indexes
    await Feedback.syncIndexes();
    console.log('✓ Feedback indexes created/updated');
    
    console.log('\nAll collections have been set up with their proper schemas and indexes!');
    console.log('Migration completed successfully!');
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };