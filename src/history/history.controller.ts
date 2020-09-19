import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { Authorization } from 'src/auth/authorization.decorator';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ReadMessageDto } from './dto/read-message.dto';
import { UsersService } from 'src/users/users.service';

@Controller('api/chatrooms')
export class HistoryController {
  constructor(
    private historyService: HistoryService,
    private chatroomsService: ChatRoomsService,
    private chatGateway: ChatGateway,
    private usersService: UsersService,
  ) {}

  @Get(':chatroomID/history') //Get history by last message's timestamp
  async getHistory(
    @Param('chatroomID') chatroomID: string, //This ID is chatroom's _id auto create by mongoDB, not chatroom identify
    @Query('lastTime') lastTime: Date, //Last message's timestamp
    @Query('number') number: number, //How many message want query
    @Authorization() user: { _id: string; username: string }, //Authorization user's JWT
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const userProfile = await this.usersService.findOneByID(user._id);
    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile) {
      throw new UnauthorizedException();
    }
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }
    const history = await this.historyService.findByChatroomIDAndTime(
      chatroomID,
      lastTime,
      Number(number),
    );

    return history;
  }

  @Post(':chatroomID/message') //Add new message(history) and using socket.io to notify client that there has new message
  async createMessage(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const userProfile = await this.usersService.findOneByID(user._id);
    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile) {
      throw new UnauthorizedException();
    }
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    //Create message and notify client
    const message = await this.historyService.createHistory(
      createMessageDto.context,
      chatroomID,
      user._id,
    );
    this.chatGateway.server.sockets.to(chatroomID).emit('message');
    return message;
  }

  @Get(':chatroomID/message') //Get latest message in this chatroom
  async getLatestMessage(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const userProfile = await this.usersService.findOneByID(user._id);
    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile) {
      throw new UnauthorizedException();
    }
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    const latestMessage = await this.historyService.findLatestOne(chatroomID);
    return latestMessage;
  }

  @Patch(':chatroomID/history/lastRead')
  async readMessage(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
    @Body() readMessageDto: ReadMessageDto,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const userProfile = await this.usersService.findOneByID(user._id);
    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile) {
      throw new UnauthorizedException();
    }
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    if (
      user._id ==
      (await this.historyService.findOneByID(readMessageDto.messageID)).author
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const readMessages = await this.historyService.readMessage(
      chatroomID,
      user._id,
      readMessageDto.messageID,
    );

    this.chatGateway.server.sockets.to(chatroomID).emit('read');

    return readMessages;
  }

  @Get(':chatroomID/history/lastRead')
  async getLatestReadMessageID(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const userProfile = await this.usersService.findOneByID(user._id);
    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile) {
      throw new UnauthorizedException();
    }
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    const latestReadMessageID = this.historyService.getLatestReadMessage(
      chatroomID,
      user._id,
    );

    return latestReadMessageID;
  }
}
