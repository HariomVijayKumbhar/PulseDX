import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Mongoose document schemas mirroring the Supabase PostgreSQL schema.
 * These let MongoDB act as an optional secondary data store alongside Supabase.
 */

export interface MongoUserDoc extends Document {
  id: string; // mirrors Supabase auth UUID so records stay linked across stores
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoProjectDoc extends Document {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'archived';
  health: 'on_track' | 'at_risk' | 'delayed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MongoTaskDoc extends Document {
  id: string;
  projectId: string;
  assigneeId: string | null;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<MongoUserDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: 'member' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const ProjectSchema = new Schema<MongoProjectDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed', 'archived'],
      default: 'planning',
    },
    health: {
      type: String,
      enum: ['on_track', 'at_risk', 'delayed'],
      default: 'on_track',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const TaskSchema = new Schema<MongoTaskDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    assigneeId: { type: String, default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const MongoUser: Model<MongoUserDoc> =
  mongoose.models.User || mongoose.model<MongoUserDoc>('User', UserSchema);

export const MongoProject: Model<MongoProjectDoc> =
  mongoose.models.Project || mongoose.model<MongoProjectDoc>('Project', ProjectSchema);

export const MongoTask: Model<MongoTaskDoc> =
  mongoose.models.Task || mongoose.model<MongoTaskDoc>('Task', TaskSchema);
