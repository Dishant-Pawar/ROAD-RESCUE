import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://deepthinkmode_db_user:IRfGC1eMXQnhCbEZ@omshantiroad.8ny7gff.mongodb.net/omshantiROAD?retryWrites=true&w=majority');
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
