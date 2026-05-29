import mongoose from 'mongoose';
export const connectToDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.mongo_uri || process.env.mongodb_url

        if (!mongoUri) {
            throw new Error('MongoDB connection string is missing')
        }

        await mongoose.connect(mongoUri)
        console.log('Connected to database'.bgGreen);
    }
    catch (error) {
        console.error('Error connecting to the database:', error);
    }

}
