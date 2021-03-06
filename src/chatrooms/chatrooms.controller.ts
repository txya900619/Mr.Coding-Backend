import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  HttpException,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { ChatRoomsService } from './chatrooms.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangeClosedDto } from './dto/change-closed.dto';
import { config } from 'dotenv';
import { BindLiffUserIDDto } from './dto/bind-liff-userID';
import { ChangeNameDto } from './dto/change-name.dto';
import {
  ChatRoom,
  ChatRoomPublic,
  ChatRoomPublicWithAvatar,
} from './chatrooms.interface';

config();
@Controller('api/chatrooms')
export class ChatRoomsController {
  constructor(private chatroomsService: ChatRoomsService) {}

  @UseGuards(AuthGuard('adminJwt'))
  @Get() //Get all chatroom, need admin authority
  async getChatRooms(): Promise<ChatRoomPublicWithAvatar[]> {
    return await this.chatroomsService.findAllWithAvatarPublic();
  }

  @Post() //Create new chatroom, only google script can use
  async createChatRoom(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Headers('authorization') auth: string, //line bot's auth token,
  ): Promise<ChatRoom> {
    if (auth != (process.env.LineBotAuth || 'cc')) {
      throw new HttpException('Permission denied', HttpStatus.UNAUTHORIZED);
    }
    const chatroom = await this.chatroomsService.create(createChatRoomDto);
    if (!chatroom) {
      throw new HttpException('chatroom crate error', HttpStatus.BAD_REQUEST);
    }
    return chatroom;
  }

  @Get(':id') //Get specific chatroom data
  async getChatroom(@Param('id') id: string): Promise<ChatRoomPublic> {
    //This ID is _id auto create by mongoDB, not chatroom identify
    const chatroom = await this.chatroomsService.findOneByIDPublic(id);
    if (!chatroom) {
      throw new HttpException(
        'not found chatroom match this id',
        HttpStatus.NOT_FOUND,
      );
    }
    return chatroom;
  }

  @UseGuards(AuthGuard('adminJwt'))
  @Patch(':id/closed') //Close the chatroom
  async changeClosed(
    @Param('id') id: string, //This ID is _id auto create by mongoDB, not chatroom identify
    @Body() changeClosedDto: ChangeClosedDto,
  ): Promise<ChatRoom> {
    const chatroom = await this.chatroomsService.updateClosed(
      id,
      changeClosedDto,
    );
    if (!chatroom) {
      throw new HttpException('not found chatroom', HttpStatus.NOT_FOUND);
    }
    return chatroom;
  }

  @Patch(':id/liffUserID')
  async bindLiffUserID(
    @Param('id') id: string,
    @Body() bindLiffUserIDDto: BindLiffUserIDDto,
  ): Promise<ChatRoom> {
    console.log(bindLiffUserIDDto);
    const chatroom = await this.chatroomsService.updateLiffUserID(
      id,
      bindLiffUserIDDto,
    );

    if (!chatroom) {
      throw new HttpException(
        'liffUserID bound, or chatroom not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    return chatroom;
  }

  @UseGuards(AuthGuard('adminJwt'))
  @Patch(':id/name') //Close the chatroom
  async changeName(
    @Param('id') id: string, //This ID is _id auto create by mongoDB, not chatroom identify
    @Body() changeNameDto: ChangeNameDto,
  ): Promise<ChatRoom> {
    const chatroom = await this.chatroomsService.updateName(id, changeNameDto);
    if (!chatroom) {
      throw new HttpException('not found chatroom', HttpStatus.NOT_FOUND);
    }
    return chatroom;
  }
}
