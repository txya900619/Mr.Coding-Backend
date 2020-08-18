import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Headers,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { Authorization } from 'src/auth/authorization.decorator';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ReadMessageDto } from './dto/read-message.dto';

@Controller('api/chatrooms')
export class HistoryController {
  constructor(
    private historyService: HistoryService,
    private chatroomsService: ChatRoomsService,
    private chatGateway: ChatGateway,
  ) {}

  @Get(':chatroomID/history') //Get history by last message's timestamp
  async getHistory(
    @Param('chatroomID') chatroomID: string, //This ID is chatroom's _id auto create by mongoDB, not chatroom identify
    @Query('lastTime') lastTime: Date, //Last message's timestamp
    @Query('number') number: number, //How many message want query
    @Headers('userID') userID: string, //Common user's line user_id
    @Authorization() user, //Authorization user's JWT
  ) {
    if (!user) {
      //If user authorization fail, check if header has userID
      if (!userID) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (
        userID !== (await this.chatroomsService.findOneByID(chatroomID)).owner
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
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
    @Headers('userID') userID: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    if (!user) {
      //If user authorization fail, check if header has userID
      if (!userID) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (
        userID !== (await this.chatroomsService.findOneByID(chatroomID)).owner
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      //Create message and notify client
      const message = await this.historyService.createHistory(
        createMessageDto.context,
        chatroomID,
        userID, //TODO: maybe need bcrypt
      );
      this.chatGateway.server.sockets.to(chatroomID).emit('message');
      return message;
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
    @Headers('userID') userID: string,
  ) {
    if (!user) {
      //If user authorization fail, check if header has userID
      if (!userID) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (
        userID !== (await this.chatroomsService.findOneByID(chatroomID)).owner
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    }

    const latestMessage = await this.historyService.findLatestOne(chatroomID);
    return latestMessage;
  }

  @Patch(':chatroomID/history/lastRead')
  async readMessage(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
    @Headers('userID') userID: string,
    @Body() readMessageDto: ReadMessageDto,
  ) {
    if (!user) {
      //If user authorization fail, check if header has userID
      if (!userID) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (
        userID !== (await this.chatroomsService.findOneByID(chatroomID)).owner
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } else {
      userID = user._id;
    }

    if (
      userID ==
      (await this.historyService.findOneByID(readMessageDto.messageID)).author
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const readMessages = await this.historyService.readMessage(
      chatroomID,
      userID,
      readMessageDto.messageID,
    );

    this.chatGateway.server.sockets.to(chatroomID).emit('read');

    return readMessages;
  }

  @Get(':chatroomID/history/lastRead')
  async getLatestReadMessageID(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
    @Headers('userID') userID: string,
  ) {
    if (!user) {
      //If user authorization fail, check if header has userID
      if (!userID) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (
        userID !== (await this.chatroomsService.findOneByID(chatroomID)).owner
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } else {
      userID = user._id;
    }

    const latestReadMessageID = this.historyService.getLatestReadMessage(
      chatroomID,
      userID,
    );

    return latestReadMessageID;
  }
}
