import * as mongoose from 'mongoose';

export const HistorySchema = new mongoose.Schema(
  {
    _id: String,
    context: String,
    chatroomID: String,
    author: String,
    read: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      get: (v: Date) => {
        if (!v) {
          return undefined;
        }
        return v.getTime();
      },
    },
    updatedAt: {
      type: Date,
      get: (v: Date) => {
        if (!v) {
          return undefined;
        }
        return v.getTime();
      },
    },
  },
  { timestamps: true, toJSON: { getters: true }, id: false },
);
