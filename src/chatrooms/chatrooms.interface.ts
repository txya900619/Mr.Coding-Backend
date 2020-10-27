import { Document } from 'mongoose';

export interface ChatRoom extends Document {
  readonly _id: string;
  readonly name: string;
  readonly lineChatroomUserID: string;
  readonly liffUserID: string;
  readonly closed: boolean;
}

export interface ChatRoomPublic extends Document {
  readonly _id: string;
  readonly name: string;
  readonly closed: boolean;
}

export interface ChatRoomPublicWithAvatar extends ChatRoomPublic {
  readonly avatar: string;
}
