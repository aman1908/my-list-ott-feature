import mongoose, { Schema, Document } from 'mongoose';
import { MyListItem } from '../types';

export interface MyListDocument extends Omit<MyListItem, 'id'>, Document {
  id: string;
}

const myListSchema = new Schema<MyListDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: ['movie', 'tvshow'],
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

myListSchema.index({ userId: 1, contentId: 1 }, { unique: true });
myListSchema.index({ userId: 1, addedAt: -1 }); 

export const MyListModel = mongoose.model<MyListDocument>('MyList', myListSchema);


