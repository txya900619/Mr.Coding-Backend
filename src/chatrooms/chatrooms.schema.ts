import * as mongoose from 'mongoose';

//TODO: should save liff user's _id, not liffUserID
export const ChatRoomSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  lineChatroomUserID: { type: String, default: '' },
  liffUserID: { type: String, default: '' },
  closed: { type: Boolean, default: false },
});
