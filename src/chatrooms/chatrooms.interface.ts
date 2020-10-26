import { Document } from 'mongoose';

export interface ChatRoom extends Document {
  readonly _id: string;
  readonly name: string;
  readonly lineChatroomUserID: string;
  readonly liffUserID: string;
  readonly closed: boolean;
}
