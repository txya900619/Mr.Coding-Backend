import { Document } from 'mongoose';

export interface Users extends Document {
  readonly _id: string;
  readonly username: string;
  readonly password: string;
}
