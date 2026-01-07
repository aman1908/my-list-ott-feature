import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser } from '../types';

export interface UserDocument extends Omit<IUser, 'id'>, Document {
  id: string;
}

const watchHistorySchema = new Schema(
  {
    contentId: { type: String, required: true },
    watchedOn: { type: Date, required: true },
    rating: { type: Number, min: 0, max: 10 },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    preferences: {
      favoriteGenres: {
        type: [String],
        enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'],
        default: [],
      },
      dislikedGenres: {
        type: [String],
        enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'],
        default: [],
      },
    },
    watchHistory: {
      type: [watchHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

// Indexes for better query performance
userSchema.index({ username: 1 });

export const UserModel = mongoose.model<UserDocument>('User', userSchema);


