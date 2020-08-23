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
import { ChangeLineAccessTokenDto } from './dto/change-line-access-token.dto';

config();
@Controller('api/chatrooms')
export class ChatRoomsController {
  constructor(private chatroomsService: ChatRoomsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get() //Get all chatroom, need admin authority
  async getChatRooms() {
    return await this.chatroomsService.findAll();
  }

  @Post() //Create new chatroom, only google script can use
  async createChatRoom(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Headers('authorization') auth, //line bot's auth token,
  ) {
    if (auth != (process.env.LineBotAuth || 'cc')) {
      throw new HttpException('Permission denied', HttpStatus.UNAUTHORIZED);
    }
    const chatroom = await this.chatroomsService.creat(createChatRoomDto);
    if (!chatroom) {
      throw new HttpException('chatroom crate error', HttpStatus.BAD_REQUEST);
    }
    return chatroom;
  }

  @Get(':id') //Get specific chatroom data
  async getChatroom(@Param('id') id: string) {
    //This ID is _id auto create by mongoDB, not chatroom identify
    const chatroom = await this.chatroomsService.findOneByID(id);
    if (!chatroom) {
      throw new HttpException(
        'not found chatroom match this id',
        HttpStatus.NOT_FOUND,
      );
    }
    return chatroom;
  }

  //TODO: This function not need(?)
  @Patch(':id/lineAccessToken') //This is use to save line user data(? , I think this function not need
  async updateLineAccessToken(
    @Param() id, //This ID is _id auto create by mongoDB, not chatroom identify
    @Headers('userID') userID,
    @Body() changeLineAccessTokenDto: ChangeLineAccessTokenDto,
  ) {
    const chatroom = await this.chatroomsService.findOneByID(id);
    if (!chatroom) {
      throw new HttpException(
        'not found chatroom match this id',
        HttpStatus.NOT_FOUND,
      );
    }
    if (userID !== chatroom.owner) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return await this.chatroomsService.changeLineAccessToken(
      id,
      changeLineAccessTokenDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
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
}
