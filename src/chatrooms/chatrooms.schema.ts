import * as mongoose from 'mongoose';

export const ChatRoomSchema = new mongoose.Schema({
  // hashed
  owner: String,
  identify: String,
  closed: { type: Boolean, default: false },
  lineAccessToken: { type: String, default: '' },
});
