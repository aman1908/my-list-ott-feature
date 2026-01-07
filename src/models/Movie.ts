import mongoose, { Schema, Document } from 'mongoose';
import { Movie as IMovie } from '../types';

export interface MovieDocument extends Omit<IMovie, 'id'>, Document {
  id: string;
}

const movieSchema = new Schema<MovieDocument>(
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
    releaseDate: {
      type: Date,
      required: true,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    actors: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one actor is required',
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
movieSchema.index({ title: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ releaseDate: -1 });

export const MovieModel = mongoose.model<MovieDocument>('Movie', movieSchema);


