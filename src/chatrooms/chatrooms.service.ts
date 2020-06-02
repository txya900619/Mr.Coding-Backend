import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom } from './chatrooms.interface';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { BindOwnerDto } from './dto/bind-owner.dto';
import { ChangeClosedDto } from './dto/change-closed.dto';
import { hash } from 'bcrypt';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectModel('ChatRoom') private readonly chatroomModel: Model<ChatRoom>,
  ) {}
  async creat(creatChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const createdChatRoom = new this.chatroomModel(creatChatRoomDto);
    return await createdChatRoom.save();
  }
  async findAll(): Promise<ChatRoom[]> {
    return await this.chatroomModel.find().exec();
  }
  async findOneByIdentify(identify: string): Promise<ChatRoom> {
    const ChatRoom = await this.chatroomModel
      .findOne({ identify: identify })
      .exec();
    return ChatRoom;
  }
  async findOneByID(id: string): Promise<ChatRoom> {
    return await this.chatroomModel.findOne({ _id: id }).exec();
  }
  async bindOwnerToChatRoom(
    id: string,
    bindOwnerDto: BindOwnerDto,
  ): Promise<ChatRoom> {
    const testChatRoom = await this.chatroomModel.findOne({ _id: id }).exec();
    if (!testChatRoom || testChatRoom.owner) {
      return null;
    }
    bindOwnerDto.owner = await hash(bindOwnerDto.owner, 10); //hash user_id
    const chatroom = await this.chatroomModel.findByIdAndUpdate(
      id,
      bindOwnerDto,
      { new: true },
    );

    return chatroom;
  }

  async changeClosed(id: string, changeClosedDto: ChangeClosedDto) {
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
}
