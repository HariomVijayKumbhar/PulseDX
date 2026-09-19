import 'dotenv/config';
import mongoose, { Connection } from 'mongoose';

const mongoUri = process.env.MONGODB_URI;

/**
 * Singleton Mongoose connection for Backend Services.
 * Connects on demand (server startup or first use) and is imported only by services.
 * Never imported in routes or controllers.
 */
export async function connectMongo(): Promise<Connection | null> {
  if (!mongoUri) {
    console.warn(
      '[MongoClient] Warning: MONGODB_URI is missing from environment variables. MongoDB features are disabled — Supabase remains the primary database. Set it in backend/.env'
    );
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10_000,
    });
    console.log('[MongoClient] ✅ Connected to MongoDB');
  } catch (err) {
    // Non-fatal: the API keeps running on Supabase if Mongo is unreachable
    console.error('[MongoClient] ❌ Failed to connect to MongoDB:', (err as Error).message);
    return null;
  }

  return mongoose.connection;
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoClient] MongoDB connection closed.');
  }
}

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export default mongoose;
