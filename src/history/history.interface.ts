import { Document } from 'mongoose';

export interface History extends Document {
  readonly _id: string;
  readonly context: string;
  readonly chatroomID: string;
  readonly author: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
