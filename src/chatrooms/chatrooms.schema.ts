import * as mongoose from 'mongoose';

export const ChatRoomSchema = new mongoose.Schema({
  // hashed
  owner: String,
  closed: { type: Boolean, default: false },
  lineAccessToken: { type: String, default: '' },
});
