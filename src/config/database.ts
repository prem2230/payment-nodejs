import mongoose from "mongoose";

export class DatabaseConfig {
    private static instance: DatabaseConfig;

    private constructor() { }

    private static getInstance(): DatabaseConfig {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfig();
        }
        return DatabaseConfig.instance;
    }

    public async connect(): Promise<void> {
        try {
            const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/payment-system';
            await mongoose.connect(mongoUri);
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        await mongoose.disconnect();
    }
}