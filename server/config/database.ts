import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('🔍 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URI:', mongoURI ? 'URI found' : 'URI not found');
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    console.error('📋 Error details:', error.message);
    process.exit(1);
  }
};