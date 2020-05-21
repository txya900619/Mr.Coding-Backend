import * as mongoose from 'mongoose';

export const ChatRoomSchema = new mongoose.Schema({
  owner: String,
  identify: String,
  closed: { type: Boolean, default: false },
});
