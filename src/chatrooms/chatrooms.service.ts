import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  ChatRoom,
  ChatRoomPublicWithAvatar,
  ChatRoomPublic,
} from './chatrooms.interface';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { ChangeClosedDto } from './dto/change-closed.dto';
import { BindLiffUserIDDto } from './dto/bind-liff-userID';
import { ChangeNameDto } from './dto/change-name.dto';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectModel('ChatRoom') private readonly chatroomModel: Model<ChatRoom>,
  ) {}

  async create(creatChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const createdChatRoom = new this.chatroomModel(creatChatRoomDto);
    return await createdChatRoom.save();
  }

  async findAllWithAvatarPublic(): Promise<ChatRoomPublicWithAvatar[]> {
    return await this.chatroomModel
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'liffUserID',
            foreignField: 'password',
            as: 'someField',
          },
        },
        {
          $addFields: {
            avatar: '$someField.avatar',
          },
        },
        {
          $unwind: '$avatar',
        },
        {
          $project: {
            someField: 0,
            lineChatroomUserID: 0,
            liffUserID: 0,
          },
        },
      ])
      .exec();
  }

  async findOneByID(id: string): Promise<ChatRoom> {
    //This ID is _id auto create by mongoDB, not chatroom identify
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.chatroomModel.findOne({ _id: id }).exec();
  }

  async findOneByIDPublic(id: string): Promise<ChatRoomPublic> {
    //This ID is _id auto create by mongoDB, not chatroom identify
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.chatroomModel
      .findOne({ _id: id })
      .select('-lineChatroomUserID -liffUserID')
      .exec();
  }

  async updateClosed(
    id: string, //This ID is _id auto create by mongoDB, not chatroom identify
    changeClosedDto: ChangeClosedDto,
  ): Promise<ChatRoom> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const chatroom = this.chatroomModel.findOne({ _id: id });
    if (!chatroom) {
      return null;
    }
    return await this.chatroomModel
      .findByIdAndUpdate(id, changeClosedDto, {
        new: true,
      })
      .exec();
  }

  //TODO: need auth
  async updateLiffUserID(
    id: string,
    bindLiffUserID: BindLiffUserIDDto,
  ): Promise<ChatRoom> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const chatroom = await this.chatroomModel.findOne({ _id: id });
    if (!chatroom) {
      return null;
    }
    if (chatroom.liffUserID != '') {
      return null;
    }
    return await this.chatroomModel
      .findByIdAndUpdate(id, bindLiffUserID, {
        new: true,
      })
      .exec();
  }

  async updateName(
    id: string, //This ID is _id auto create by mongoDB, not chatroom identify
    changeNameDto: ChangeNameDto,
  ): Promise<ChatRoom> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const chatroom = this.chatroomModel.findOne({ _id: id });
    if (!chatroom) {
      return null;
    }
    return await this.chatroomModel
      .findByIdAndUpdate(id, changeNameDto, {
        new: true,
      })
      .exec();
  }
}
