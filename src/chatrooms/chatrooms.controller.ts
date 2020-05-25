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
} from '@nestjs/common';
import { CreateChatRoomDto } from './dto/create-chatroom.dto';
import { ChatRoomsService } from './chatrooms.service';
import { BindOwnerDto } from './dto/bind-owner.dto';

@Controller('api/chatrooms')
export class ChatRoomsController {
  constructor(private chatroomsService: ChatRoomsService) {}

  @Get()
  async getChatRoom(@Query('identify') identify) {
    if (!identify) {
      throw new HttpException(
        `should give identify query parameter`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const chatroom = await this.chatroomsService.getChatRoomByIdentify(
      identify,
    );
    if (!chatroom) {
      throw new HttpException(
        `Not found chatroom match this identify: ${identify}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return chatroom;
  }

  @Post()
  async createChatRoom(@Body() createChatRoomDto: CreateChatRoomDto) {
    const chatroom = await this.chatroomsService.creat(createChatRoomDto);
    return chatroom;
  }

  @Patch(':id')
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
}
