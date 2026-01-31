/**
 * Migration: Add user activation index
 * Description: Creates an index on the isActive field of the User collection
 * for faster queries when filtering active/inactive users
 */

const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = {
  // Migration name
  name: 'Add user activation index',
  
  // Migration description
  description: 'Creates an index on the isActive field of the User collection',
  
  // Function to run the migration
  up: async () => {
    console.log('Creating index on User.isActive field...');
    
    // Create index on isActive field
    await User.createIndex({ isActive: 1 });
    
    console.log('✓ User activation index created');
  },
  
  // Function to rollback the migration (if needed)
  down: async () => {
    console.log('Dropping index on User.isActive field...');
    
    // Drop index on isActive field
    await User.collection.dropIndex('isActive_1');
    
    console.log('✓ User activation index dropped');
  }
};