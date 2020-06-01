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
  Request,
} from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { ChatRoomsService } from './chatrooms.service';
import { BindOwnerDto } from './dto/bind-owner.dto';
import { Authorization } from 'src/auth/authorization.decorator';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'express';
import { ChangeClosedDto } from './dto/change-closed.dto';

@Controller('api/chatrooms')
export class ChatRoomsController {
  constructor(private chatroomsService: ChatRoomsService) {}

  @Get()
  async getChatRoom(@Query('identify') identify, @Authorization() user) {
    if (identify) {
      const chatroom = await this.chatroomsService.findOneByIdentify(identify);
      if (!chatroom) {
        throw new HttpException(
          `Not found chatroom match this identify: ${identify}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return chatroom;
    } else {
      if (!user) {
        throw new HttpException(`Permission denied`, HttpStatus.UNAUTHORIZED);
      }
      return await this.chatroomsService.findAll();
    }
  }

  @Post() // need auth
  async createChatRoom(@Body() createChatRoomDto: CreateChatRoomDto) {
    const chatroom = await this.chatroomsService.creat(createChatRoomDto);
    if (!chatroom) {
      throw new HttpException('chatroom crate error', HttpStatus.BAD_REQUEST);
    }
    return chatroom;
  }

  @Patch(':id/owner')
  async bindOwner(@Param('id') id, @Body() bindOwnerDto: BindOwnerDto) {
    const chatroom = await this.chatroomsService.bindOwnerToChatRoom(
      id,
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

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/closed')
  async changeClosed(
    @Param(':id') id,
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
