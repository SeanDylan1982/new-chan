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

    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    // Simplified connection options that work better with Atlas
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Increased to 30 seconds
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
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
      console.error('❌ MongoDB connection error:', err.message);
      console.error('❌ Full error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    console.log('⏳ Establishing connection...');
    
    // Add timeout wrapper
    const connectWithTimeout = () => {
      return Promise.race([
        mongoose.connect(mongoURI, connectionOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
        )
      ]);
    };

    const conn = await connectWithTimeout() as typeof mongoose;
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🏠 Host: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔌 Connection State: ${conn.connection.readyState}`);
    
    // Test the connection by counting documents
    try {
      console.log('🧪 Testing database operations...');
      const db = conn.connection.db;
      
      if (!db) {
        throw new Error('Database object is null');
      }
      
      const collections = await db.listCollections().toArray();
      console.log(`📋 Collections Available: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'None'}`);
      
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
        console.log('⚠️ No boards found in database. Creating sample data...');
        await createSampleData(db);
      } else {
        console.log('✅ Database contains data and is ready for use!');
      }
      
    } catch (statsError) {
      console.warn('⚠️ Could not fetch database stats:', statsError.message);
      console.warn('⚠️ Full stats error:', statsError);
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
    console.error('📋 Full Error:', error);
    
    if (error.message.includes('timeout')) {
      console.error('⏰ Connection timed out. Most common causes:');
      console.error('   1. 🌐 IP address not whitelisted in MongoDB Atlas Network Access');
      console.error('   2. 🔌 Network connectivity issues or firewall blocking connection');
      console.error('   3. ⏸️ MongoDB Atlas cluster is paused or unavailable');
      console.error('   4. 🔐 Invalid credentials (username/password)');
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Server selection failed. This usually means:');
      console.error('   1. 🚫 IP not whitelisted in MongoDB Atlas');
      console.error('   2. 🔐 Invalid credentials (username/password)');
      console.error('   3. 🌐 Network/DNS issues');
      console.error('   4. 🔗 Incorrect connection string format');
    }
    
    // Re-throw the error to be handled by the server startup
    throw error;
  }
};

// Create sample data if database is empty
const createSampleData = async (db: any) => {
  try {
    console.log('🔄 Creating sample data...');
    
    // Create a sample user
    const sampleUser = {
      username: 'SystemAdmin',
      email: 'admin@neoboard.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6', // hashed 'password'
      isAnonymous: false,
      joinDate: new Date(),
      postCount: 0,
      isActive: true,
      lastSeen: new Date()
    };
    
    const userResult = await db.collection('users').insertOne(sampleUser);
    console.log('✅ Sample user created:', userResult.insertedId);
    
    // Create sample boards
    const sampleBoards = [
      {
        name: '/tech/',
        description: 'Technology discussions, programming, and software development',
        category: 'Technology',
        threadCount: 42,
        postCount: 1337,
        lastActivity: new Date(),
        isNSFW: false,
        isActive: true,
        createdBy: userResult.insertedId
      },
      {
        name: '/gaming/',
        description: 'Video games, esports, and gaming culture',
        category: 'Entertainment',
        threadCount: 28,
        postCount: 892,
        lastActivity: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago
        isNSFW: false,
        isActive: true,
        createdBy: userResult.insertedId
      },
      {
        name: '/art/',
        description: 'Digital art, traditional art, and creative works',
        category: 'Creative',
        threadCount: 15,
        postCount: 456,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isNSFW: false,
        isActive: true,
        createdBy: userResult.insertedId
      },
      {
        name: '/random/',
        description: 'Random discussions and off-topic conversations',
        category: 'General',
        threadCount: 67,
        postCount: 2103,
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isNSFW: false,
        isActive: true,
        createdBy: userResult.insertedId
      }
    ];
    
    const boardResult = await db.collection('boards').insertMany(sampleBoards);
    console.log('✅ Sample boards created:', Object.keys(boardResult.insertedIds).length);
    
    console.log('🎉 Sample data creation completed!');
    
  } catch (error) {
    console.error('❌ Failed to create sample data:', error);
  }
};