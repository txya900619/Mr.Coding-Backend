import * as mongoose from 'mongoose';

export const HistorySchema = new mongoose.Schema(
  {
    context: String,
    chatroomID: String,
    author: String,
    read: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      get: (v: Date) => {
        return v.getTime();
      },
    },
    updatedAt: {
      type: Date,
      get: (v: Date) => {
        return v.getTime();
      },
    },
  },
  { timestamps: true, toJSON: { getters: true } },
);
