import * as mongoose from 'mongoose';

export const HistorySchema = new mongoose.Schema(
  {
    context: String,
    chatroomID: String,
    author: String, //If author is user(admin) it will be user's _id,if author is common user it will be it's line user_id
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
