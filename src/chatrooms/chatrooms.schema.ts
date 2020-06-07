import * as mongoose from 'mongoose';

export const ChatRoomSchema = new mongoose.Schema({
  _id: String,
  owner: String,
  identify: String,
  closed: { type: Boolean, default: false },
  lineAccessToken: { type: String, default: '' },
});
