import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('🔍 Starting MongoDB connection process...');
    console.log('📍 MongoDB URI:', mongoURI ? `${mongoURI.substring(0, 20)}...` : 'URI not found');
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI environment variable is not set!');
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Add connection options for better reliability
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState}`);
    console.log(`📋 Collections Available: ${Object.keys(conn.connection.collections).join(', ')}`);
    
    // Test the connection by counting documents
    try {
      const boardCount = await mongoose.connection.db.collection('boards').countDocuments();
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      const threadCount = await mongoose.connection.db.collection('threads').countDocuments();
      const postCount = await mongoose.connection.db.collection('posts').countDocuments();
      
      console.log(`📈 Database Stats:`);
      console.log(`   - Boards: ${boardCount}`);
      console.log(`   - Users: ${userCount}`);
      console.log(`   - Threads: ${threadCount}`);
      console.log(`   - Posts: ${postCount}`);
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
      console.error('💡 Possible solutions:');
      console.error('   1. Make sure MongoDB is running on your system');
      console.error('   2. Check if the connection string is correct');
      console.error('   3. Verify the database name exists');
      console.error('   4. Check firewall/network settings');
    }
    
    console.error('🔧 Current MongoDB URI:', process.env.MONGODB_URI);
    process.exit(1);
  }
};