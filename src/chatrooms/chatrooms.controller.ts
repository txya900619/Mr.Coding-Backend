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

config();
@Controller('api/chatrooms')
export class ChatRoomsController {
  constructor(private chatroomsService: ChatRoomsService) {}

  @UseGuards(AuthGuard('adminJwt'))
  @Get() //Get all chatroom, need admin authority
  async getChatRooms() {
    return await this.chatroomsService.findAllWithoutUserID();
  }

  @Post() //Create new chatroom, only google script can use
  async createChatRoom(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Headers('authorization') auth, //line bot's auth token,
  ) {
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
  async getChatroom(@Param('id') id: string) {
    //This ID is _id auto create by mongoDB, not chatroom identify
    const chatroom = await this.chatroomsService.findOneByIDWithoutUserID(id);
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
    @Param('id') id, //This ID is _id auto create by mongoDB, not chatroom identify
    @Body() changeClosedDto: ChangeClosedDto,
  ) {
    const chatroom = await this.chatroomsService.changeClosed(
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
    @Param('id') id,
    @Body() bindLiffUserIDDto: BindLiffUserIDDto,
  ) {
    const chatroom = await this.chatroomsService.changeLiffUserID(
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
}
