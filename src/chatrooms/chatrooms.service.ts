import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom } from './chatrooms.interface';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { BindOwnerDto } from './dto/bind-owner.dto';
import { HistoryService } from 'src/history/history.service';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectModel('ChatRoom') private readonly chatroomModel: Model<ChatRoom>,
    private readonly historyService: HistoryService,
  ) {}
  async creat(creatChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const createdChatRoom = new this.chatroomModel(creatChatRoomDto);
    return createdChatRoom.save();
  }
  async getChatRoomByIdentify(identify: string): Promise<ChatRoom> {
    const ChatRoom = this.chatroomModel.findOne({ identify: identify });
    return ChatRoom;
  }
  async bindOwnerToChatRoom(
    id: string,
    bindOwnerDto: BindOwnerDto,
  ): Promise<ChatRoom> {
    let testChatRoom;
    try {
      testChatRoom = await this.chatroomModel.findById(id);
    } catch (e) {
      throw new HttpException(
        `not found chatroom match this id: ${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (testChatRoom.owner) {
      throw new HttpException(
        `this chatroom have a owner`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const chatroom = await this.chatroomModel.findByIdAndUpdate(
      id,
      bindOwnerDto,
    );

    return chatroom;
  }
  async saveMessageToHistoryOwner(id: string, context: string) {
    this.historyService.createHistory(
      context,
      id,
      (await this.chatroomModel.findById(id)).owner,
    );
  }
  async saveMessageToHistoryAdmin(id: string, context: string) {
    this.historyService.createHistory(context, id, 'admin');
  }
}
