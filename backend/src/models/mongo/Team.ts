import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Team / Group model — stored in MongoDB (secondary store alongside Supabase).
 * A team groups members and can be attached to projects for collaboration.
 */

export interface TeamMember {
  userId: string; // Supabase auth UUID
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface TeamDoc extends Document {
  name: string;
  description: string;
  ownerId: string;
  projectIds: string[];
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<TeamMember>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TeamSchema = new Schema<TeamDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    ownerId: { type: String, required: true, index: true },
    projectIds: { type: [String], default: [], index: true },
    members: { type: [MemberSchema], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export const Team: Model<TeamDoc> =
  mongoose.models.Team || mongoose.model<TeamDoc>('Team', TeamSchema);

export default Team;
