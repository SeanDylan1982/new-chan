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

    // Show partial URI for debugging (hide credentials)
    const uriForLogging = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('📍 Connecting to:', uriForLogging);

    // Validate URI format
    if (!mongoURI.includes('mongodb')) {
      console.error('❌ Invalid MongoDB URI format');
      throw new Error('Invalid MongoDB URI format');
    }

    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    console.log('⏱️ Connection timeout set to 10 seconds...');
    
    // Add connection options for Atlas with more aggressive timeouts
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority'
    };

    console.log('🔧 Connection options:', JSON.stringify(connectionOptions, null, 2));
    
    // Set up connection event listeners BEFORE connecting
    mongoose.connection.on('connecting', () => {
      console.log('🔄 MongoDB connection state: connecting...');
    });

    mongoose.connection.on('connected', () => {
      console.log('🔗 MongoDB connection state: connected');
    });

    mongoose.connection.on('open', () => {
      console.log('📂 MongoDB connection state: open');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error during connection:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Add a timeout promise to catch hanging connections
    const connectionPromise = mongoose.connect(mongoURI, connectionOptions);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection timeout after 15 seconds'));
      }, 15000);
    });

    console.log('⏳ Starting connection race (15 second timeout)...');
    const conn = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState}`);
    console.log(`🆔 Connection ID: ${conn.connection.id}`);
    
    // Test the connection by counting documents
    try {
      console.log('🧪 Testing database operations...');
      const db = conn.connection.db;
      
      console.log('📋 Listing collections...');
      const collections = await db.listCollections().toArray();
      console.log(`📋 Collections Available: ${collections.map(c => c.name).join(', ')}`);
      
      console.log('🔢 Counting documents...');
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
      } else {
        console.log('✅ Database contains data and is ready for use!');
      }
      
    } catch (statsError) {
      console.warn('⚠️ Could not fetch database stats:', statsError.message);
      console.warn('   This might indicate a permissions issue or database problem');
    }
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Received SIGINT, closing MongoDB connection...');
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('📋 Error Type:', error.name);
    console.error('📋 Error Message:', error.message);
    console.error('📋 Error Stack:', error.stack);
    
    if (error.message.includes('timeout')) {
      console.error('⏰ Connection timed out. Possible causes:');
      console.error('   1. Network connectivity issues');
      console.error('   2. MongoDB Atlas cluster is paused or unavailable');
      console.error('   3. Firewall blocking the connection');
      console.error('   4. IP address not whitelisted in Atlas');
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Possible solutions for Atlas connection:');
      console.error('   1. Check if your IP address is whitelisted in MongoDB Atlas');
      console.error('   2. Verify username and password are correct');
      console.error('   3. Ensure the database name exists');
      console.error('   4. Check if the cluster is running');
      console.error('   5. Verify network connectivity');
      console.error('   6. Try connecting from MongoDB Compass with the same URI');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('💡 MongoDB URI parsing error - check the connection string format');
    }
    
    // Show current connection state
    console.error('🔍 Current connection state:', mongoose.connection.readyState);
    console.error('🔍 Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    // Don't exit the process, let the server continue running
    console.error('🚀 Server will continue running without database connection');
    console.error('🔧 Fix the database connection and restart the server');
    
    // Don't call process.exit(1) - let the server run
  }
};