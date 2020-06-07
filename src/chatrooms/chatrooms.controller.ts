import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { ChatRoomsService } from './chatrooms.service';
import { BindOwnerDto } from './dto/bind-owner.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangeClosedDto } from './dto/change-closed.dto';
import { config } from 'dotenv';
import { compare } from 'bcrypt';
import { ChangeLineAccessTokenDto } from './dto/change-line-access-token.dto';

config();
@Controller('api/chatrooms')
export class ChatRoomsController {
  constructor(private chatroomsService: ChatRoomsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getChatRooms() {
    return await this.chatroomsService.findAll();
  }

  @Post() // need auth
  async createChatRoom(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Headers('authorization') auth,
  ) {
    if (auth != (process.env.googleScriptAuth || 'cc')) {
      throw new HttpException('Permission denied', HttpStatus.UNAUTHORIZED);
    }
    const chatroom = await this.chatroomsService.creat(createChatRoomDto);
    if (!chatroom) {
      throw new HttpException('chatroom crate error', HttpStatus.BAD_REQUEST);
    }
    return chatroom;
  }

  @Get(':id')
  async getChatroom(@Param('id') id: string) {
    const chatroom = await this.chatroomsService.findOneByID(id);
    if (!chatroom) {
      throw new HttpException(
        'not found chatroom match this id',
        HttpStatus.NOT_FOUND,
      );
    }
    return chatroom;
  }

  @Patch(':id/lineAccessToken')
  async updateLineAccessToken(
    @Param() id,
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
    if (!(await compare(userID, chatroom.owner))) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return await this.chatroomsService.changeLineAccessToken(
      id,
      changeLineAccessTokenDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/closed')
  async changeClosed(
    @Param('id') id,
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

  @Patch('identify/:identify/owner')
  async bindOwner(
    @Param('identify') identify,
    @Body() bindOwnerDto: BindOwnerDto,
  ) {
    const chatroom = await this.chatroomsService.bindOwnerToChatRoom(
      identify,
      bindOwnerDto,
    );
    if (!chatroom) {
      throw new HttpException(
        'not found chatroom or this chatroom have a owner',
        HttpStatus.BAD_REQUEST,
      );
    }
    return chatroom;
  }
}
