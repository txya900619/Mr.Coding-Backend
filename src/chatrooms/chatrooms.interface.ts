import { Document } from 'mongoose';

export interface ChatRoom extends Document {
  readonly _id: string;
  readonly owner: string;
  readonly closed: boolean;
  readonly lineAccessToken: string;
}
