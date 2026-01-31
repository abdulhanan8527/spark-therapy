const mongoose = require('mongoose');
const config = require('./environment');

let isConnected = false;
let connectionRetries = 0;
const maxRetries = config.get('DB_MAX_RETRIES');

const connectDB = async () => {
  try {
    const dbOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: config.get('DB_CONNECTION_POOL_SIZE'),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log(`Attempting to connect to MongoDB at ${config.get('MONGODB_URI')}...`);
    
    const conn = await mongoose.connect(config.get('MONGODB_URI'), dbOptions);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection pool size: ${config.get('DB_CONNECTION_POOL_SIZE')}`);
    
    isConnected = true;
    connectionRetries = 0; // Reset retry counter on successful connection
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
      isConnected = false;
      attemptReconnect();
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });
    
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    isConnected = false;
    attemptReconnect();
  }
};

const attemptReconnect = async () => {
  if (connectionRetries < maxRetries) {
    connectionRetries++;
    const delay = config.get('DB_RETRY_DELAY');
    console.log(`🔄 Attempting to reconnect (${connectionRetries}/${maxRetries}) in ${delay/1000} seconds...`);
    
    setTimeout(() => {
      connectDB();
    }, delay);
  } else {
    console.error('💥 Maximum reconnection attempts reached. Database unavailable.');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down database connection...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

// Export connection status for use in routes
connectDB.is_connected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;