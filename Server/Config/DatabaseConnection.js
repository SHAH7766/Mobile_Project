import mongoose from 'mongoose';
export const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.mongodb_url)
        console.log('Connected to database'.bgGreen);
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
    }

}