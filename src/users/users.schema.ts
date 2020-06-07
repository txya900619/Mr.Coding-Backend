import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  username: String,
  password: String,
  avatar: { type: String, default: '' }, // need default img
  info: { type: String, default: '' },
  cc: { type: Boolean, default: false },
});
