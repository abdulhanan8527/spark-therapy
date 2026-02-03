// Quick test script to create a therapist user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');

async function createTestTherapist() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/spark_therapy');
    console.log('Connected to MongoDB');

    // Check if therapist already exists
    const existingTherapist = await User.findOne({ email: 'therapist@test.com' });
    if (existingTherapist) {
      console.log('Therapist already exists:', existingTherapist.name);
      return;
    }

    // Create new therapist
    const hashedPassword = await bcrypt.hash('TherapistPass123!', 10);
    const therapist = new User({
      name: 'Test Therapist',
      email: 'therapist@test.com',
      password: hashedPassword,
      role: 'therapist',
      isActive: true
    });

    const savedTherapist = await therapist.save();
    console.log('Created therapist:', savedTherapist.name);
    
    // Also create some test parents
    const existingParent = await User.findOne({ email: 'parent@test.com' });
    if (!existingParent) {
      const parent = new User({
        name: 'Test Parent',
        email: 'parent@test.com',
        password: await bcrypt.hash('ParentPass123!', 10),
        role: 'parent',
        isActive: true
      });
      await parent.save();
      console.log('Created parent: Test Parent');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test users:', error);
  }
}

createTestTherapist();