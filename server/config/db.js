const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ubaid-al-abayat';

  // Try Atlas connection if configured
  if (!mongoUri.includes('localhost') && !mongoUri.includes('127.0.0.1')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 6000, // Wait up to 6 seconds for Atlas
      });
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`Atlas connection failed: ${err.message}`);
      console.log('Falling back to local or in-memory database...');
    }
  }

  // Fallback to local / in-memory server
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
  } catch (err) {
    console.log('Local MongoDB not running. Spawning in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
    } catch (memErr) {
      console.error(`Failed to start in-memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
