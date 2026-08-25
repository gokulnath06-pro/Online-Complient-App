import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/complaint_system_db';

  try {
    // Attempt standard connection with 3000ms serverSelectionTimeoutMS
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected to Primary Database: ${conn.connection.host}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`⚠️ Primary MongoDB unavailable (${primaryErr.message}).`);
    console.log('🔄 Initializing embedded MongoDB Memory Server for seamless zero-config operation...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Connected to Embedded In-Memory MongoDB: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error('❌ Failed to initialize MongoDB connection:', memErr.message);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
