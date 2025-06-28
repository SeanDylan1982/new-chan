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
    console.log('⏱️ Connection timeout set to 30 seconds...');
    
    // Updated connection options with more lenient timeouts and better error handling
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 60000, // Increased socket timeout
      connectTimeoutMS: 30000, // Increased connection timeout
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1, // Reduced minimum pool size
      retryWrites: true,
      w: 'majority',
      // Add these options for better Atlas compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Heartbeat frequency for connection monitoring
      heartbeatFrequencyMS: 10000,
      // Server selection retry
      // serverSelectionRetryDelayMS: 2000,
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
      console.error('❌ Error details:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Test connection with a simple ping first
    console.log('🏓 Testing basic connectivity...');
    
    try {
      // Create a temporary connection to test basic connectivity
      const testConnection = await mongoose.createConnection(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      
      console.log('✅ Basic connectivity test passed');
      await testConnection.close();
      
    } catch (testError) {
      console.error('❌ Basic connectivity test failed:', testError.message);
      
      // Provide specific guidance based on error type
      if (testError.message.includes('ENOTFOUND') || testError.message.includes('ECONNREFUSED')) {
        console.error('🌐 Network connectivity issue detected');
        console.error('💡 Possible solutions:');
        console.error('   1. Check your internet connection');
        console.error('   2. Verify the MongoDB Atlas cluster hostname');
        console.error('   3. Check if your firewall is blocking outbound connections');
        throw new Error('Network connectivity issue - cannot reach MongoDB Atlas');
      }
      
      if (testError.message.includes('Authentication failed')) {
        console.error('🔐 Authentication issue detected');
        console.error('💡 Possible solutions:');
        console.error('   1. Verify username and password in MONGO_URI');
        console.error('   2. Check if the database user exists in Atlas');
        console.error('   3. Ensure the user has proper permissions');
        throw new Error('Authentication failed - check credentials');
      }
      
      if (testError.message.includes('not authorized') || testError.message.includes('IP')) {
        console.error('🚫 IP whitelist issue detected');
        console.error('💡 Solutions:');
        console.error('   1. Add your current IP to MongoDB Atlas Network Access');
        console.error('   2. Or add 0.0.0.0/0 for development (not recommended for production)');
        console.error('   3. Check if your IP has changed recently');
        throw new Error('IP not whitelisted - check MongoDB Atlas Network Access');
      }
      
      // Re-throw the original error if we can't categorize it
      throw testError;
    }

    // If basic test passed, proceed with full connection
    console.log('⏳ Establishing full connection...');
    const connectionPromise = mongoose.connect(mongoURI, connectionOptions);
    
    // Increased timeout to 45 seconds for full connection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Full connection timeout after 45 seconds'));
      }, 45000);
    });

    console.log('⏳ Starting connection race (45 second timeout)...');
    const conn = await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState}`);
    console.log(`🆔 Connection ID: ${conn.connection.id}`);
    
    // Test the connection by counting documents with error handling
    try {
      console.log('🧪 Testing database operations...');
      const db = conn.connection.db;
      
      console.log('📋 Listing collections...');
      const collections = await db.listCollections().toArray();
      console.log(`📋 Collections Available: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None'}`);
      
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
      console.warn('   This might indicate a permissions issue, but connection is established');
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
    
    // Don't log the full stack trace as it's not helpful for connection issues
    if (process.env.NODE_ENV === 'development') {
      console.error('📋 Error Stack:', error.stack);
    }
    
    // Provide actionable guidance based on error patterns
    if (error.message.includes('timeout')) {
      console.error('⏰ Connection timed out. Most common causes:');
      console.error('   1. 🌐 IP address not whitelisted in MongoDB Atlas Network Access');
      console.error('   2. 🔌 Network connectivity issues or firewall blocking connection');
      console.error('   3. ⏸️ MongoDB Atlas cluster is paused or unavailable');
      console.error('   4. 🌍 DNS resolution issues');
      console.error('');
      console.error('🔧 Quick fixes to try:');
      console.error('   1. Go to MongoDB Atlas → Network Access → Add IP Address → Add Current IP');
      console.error('   2. Or temporarily add 0.0.0.0/0 (allow all IPs) for testing');
      console.error('   3. Check if your cluster is running in MongoDB Atlas');
      console.error('   4. Try connecting with MongoDB Compass using the same URI');
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Server selection failed. This usually means:');
      console.error('   1. 🚫 IP not whitelisted in MongoDB Atlas');
      console.error('   2. 🔐 Invalid credentials (username/password)');
      console.error('   3. 🌐 Network/DNS issues');
      console.error('   4. ⏸️ Cluster is paused or deleted');
    }
    
    if (error.name === 'MongoParseError') {
      console.error('💡 MongoDB URI parsing error - check the connection string format');
      console.error('   Expected format: mongodb+srv://username:password@cluster.mongodb.net/database');
    }
    
    // Show current connection state
    console.error('🔍 Current connection state:', mongoose.connection.readyState);
    console.error('🔍 Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting');
    
    console.error('');
    console.error('🚀 Server will continue running without database connection');
    console.error('🔧 Fix the database connection and restart the server');
    console.error('');
    console.error('📞 Need help? Check these resources:');
    console.error('   - MongoDB Atlas Network Access: https://cloud.mongodb.com/');
    console.error('   - Connection troubleshooting: https://docs.mongodb.com/manual/reference/connection-string/');
    
    // Don't exit the process - let the server run without DB
    return null;
  }
};