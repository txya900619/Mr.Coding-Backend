import * as mongoose from 'mongoose';

export const ChatRoomSchema = new mongoose.Schema({
  lineChatroomUserID: { type: String, default: '' },
  liffUserID: { type: String, default: '' },
  closed: { type: Boolean, default: false },
});
