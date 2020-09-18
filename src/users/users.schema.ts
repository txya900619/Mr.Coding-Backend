import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  username: String,
  password: String, //hash by bcrypt
  avatar: { type: String, default: '' }, //Need default img
  info: { type: String, default: '' },
  cc: { type: Boolean, default: false }, //TU needed
  admin: { type: Boolean, default: false },
});
