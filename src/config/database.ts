import mongoose from 'mongoose';

export const connectDatabase = async (uri?: string): Promise<void> => {
  try {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/ott-platform';
    
    await mongoose.connect(mongoUri);
    
    console.log('MongoDB connected successfully');
    
    mongoose.connection.on('error', (error:any) => {
      console.error(' MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};


