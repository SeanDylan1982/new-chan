import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    console.log('🔍 Starting MongoDB connection process...');
    console.log('📍 MongoDB URI format check:', mongoURI ? 'URI exists' : 'URI missing');
    
    if (!mongoURI) {
      console.error('❌ MONGO_URI environment variable is not set!');
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Validate URI format
    if (!mongoURI.includes('mongodb')) {
      console.error('❌ Invalid MongoDB URI format');
      throw new Error('Invalid MongoDB URI format');
    }

    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    // Add connection options for Atlas
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState}`);
    
    // Test the connection by counting documents
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`📋 Collections Available: ${collections.map(c => c.name).join(', ')}`);
      
      const boardCount = await db.collection('boards').countDocuments();
      const userCount = await db.collection('users').countDocuments();
      const threadCount = await db.collection('threads').countDocuments();
      const postCount = await db.collection('posts').countDocuments();
      
      console.log(`📈 Database Stats:`);
      console.log(`   - Boards: ${boardCount}`);
      console.log(`   - Users: ${userCount}`);
      console.log(`   - Threads: ${threadCount}`);
      console.log(`   - Posts: ${postCount}`);
      
      if (boardCount === 0) {
        console.log('⚠️ No boards found in database. You may need to create some test data.');
      }
      
    } catch (statsError) {
      console.warn('⚠️ Could not fetch database stats:', statsError.message);
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Received SIGINT, closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('📋 Error Type:', error.name);
    console.error('📋 Error Message:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Possible solutions for Atlas connection:');
      console.error('   1. Check if your IP address is whitelisted in MongoDB Atlas');
      console.error('   2. Verify username and password are correct');
      console.error('   3. Ensure the database name exists');
      console.error('   4. Check if the cluster is running');
      console.error('   5. Verify network connectivity');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('💡 MongoDB URI parsing error - check the connection string format');
    }
    
    // Don't log the full URI for security, but show if it's formatted correctly
    const uriCheck = mongoURI ? 'URI provided' : 'URI missing';
    console.error('🔧 MongoDB URI status:', uriCheck);
    
    process.exit(1);
  }
};