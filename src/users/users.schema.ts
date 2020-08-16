import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  username: String,
  password: String, //TODO: need hash
  avatar: { type: String, default: '' }, //Need default img
  info: { type: String, default: '' },
  cc: { type: Boolean, default: false }, //TU needed
});
