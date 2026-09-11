const mongoose = require('mongoose');

let mongoServer;
let cachedConn = null;

const connectDB = async () => {
  // If already connected, reuse existing database connection
  if (cachedConn && mongoose.connection.readyState >= 1) {
    return cachedConn;
  }

  let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ubaid-al-abayat';

  // Try Atlas connection if configured
  if (!mongoUri.includes('localhost') && !mongoUri.includes('127.0.0.1')) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 6000,
      });
      cachedConn = conn;
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`Atlas connection failed: ${err.message}`);
      // If SRV / TXT lookup timed out on cluster0.zz9m7gy, try direct shards
      if (mongoUri.includes('cluster0.zz9m7gy.mongodb.net')) {
        try {
          console.log('Attempting direct shard connection (bypassing SRV/TXT lookup)...');
          const directUri = 'mongodb://abdullah_gufran_26:260497@ac-y896bwf-shard-00-00.zz9m7gy.mongodb.net:27017,ac-y896bwf-shard-00-01.zz9m7gy.mongodb.net:27017,ac-y896bwf-shard-00-02.zz9m7gy.mongodb.net:27017/ubaid-al-abayat?ssl=true&authSource=admin&retryWrites=true&w=majority';
          const conn = await mongoose.connect(directUri, {
            serverSelectionTimeoutMS: 6000,
          });
          cachedConn = conn;
          console.log(`MongoDB Connected (Atlas Direct): ${conn.connection.host}`);
          return conn;
        } catch (directErr) {
          console.error(`Direct shard connection failed: ${directErr.message}`);
        }
      }
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
