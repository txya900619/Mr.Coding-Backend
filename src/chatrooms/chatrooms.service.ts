import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { ChatRoom } from './chatrooms.interface';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { ChangeClosedDto } from './dto/change-closed.dto';
import { BindLiffUserIDDto } from './dto/bind-liff-userID';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectModel('ChatRoom') private readonly chatroomModel: Model<ChatRoom>,
  ) {}

  async create(creatChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const createdChatRoom = new this.chatroomModel(creatChatRoomDto);
    return await createdChatRoom.save();
  }

  async findAllWithoutUserID(): Promise<ChatRoom[]> {
    return await this.chatroomModel
      .find()
      .select('-lineChatroomUserID -liffUserID')
      .exec();
  }

  async findOneByID(id: string): Promise<ChatRoom> {
    //This ID is _id auto create by mongoDB, not chatroom identify
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.chatroomModel.findOne({ _id: id }).exec();
  }

  async findOneByIDWithoutUserID(id: string): Promise<ChatRoom> {
    //This ID is _id auto create by mongoDB, not chatroom identify
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.chatroomModel
      .findOne({ _id: id })
      .select('-lineChatroomUserID -liffUserID')
      .exec();
  }

  async changeClosed(
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
  async changeLiffUserID(
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
}
