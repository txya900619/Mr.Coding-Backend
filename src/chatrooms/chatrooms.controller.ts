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
  @Get() //Get all chatroom, need admin authority
  async getChatRooms() {
    return await this.chatroomsService.findAll();
  }

  @Post() //Create new chatroom, only google script can use
  async createChatRoom(
    //TODO: Change this function to fit line bot form service
    @Body() createChatRoomDto: CreateChatRoomDto,
    @Headers('authorization') auth, //google script's auth token,
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

  @Get(':id') //Get specific chatroom data
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

  @Patch(':id/lineAccessToken') //This is use to save line user data(? , I think this function not need
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
  @Patch(':id/closed') //Close the chatroom
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
