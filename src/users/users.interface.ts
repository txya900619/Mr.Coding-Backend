import { Document } from 'mongoose';

export interface Users extends Document {
  readonly _id: string;
  readonly username: string;
  readonly password: string;
  readonly avatar: string;
  readonly info: string;
  readonly cc: boolean; // TU needed
  readonly admin: boolean;
}
