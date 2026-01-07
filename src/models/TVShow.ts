import mongoose, { Schema, Document } from 'mongoose';
import { TVShow as ITVShow } from '../types';

export interface TVShowDocument extends Omit<ITVShow, 'id'>, Document {
  id: string;
}

const episodeSchema = new Schema(
  {
    episodeNumber: { type: Number, required: true, min: 1 },
    seasonNumber: { type: Number, required: true, min: 1 },
    releaseDate: { type: Date, required: true },
    director: { type: String, required: true, trim: true },
    actors: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one actor is required',
      },
    },
  },
  { _id: false }
);

const tvShowSchema = new Schema<TVShowDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    genres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one genre is required',
      },
    },
    episodes: {
      type: [episodeSchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length > 0,
        message: 'At least one episode is required',
      },
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
tvShowSchema.index({ title: 1 });
tvShowSchema.index({ genres: 1 });

export const TVShowModel = mongoose.model<TVShowDocument>('TVShow', tvShowSchema);


