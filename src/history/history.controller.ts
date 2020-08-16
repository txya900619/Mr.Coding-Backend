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
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { Authorization } from 'src/auth/authorization.decorator';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatGateway } from 'src/chat/chat.gateway';

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
      //if user authorization fail, check if header has userID
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

  @Post(':chatroomID/message')
  async createMessage(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
    @Headers('userID') userID: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    if (!user) {
      //if user authorization fail, check if header has userID
      if (!userID) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (
        userID !== (await this.chatroomsService.findOneByID(chatroomID)).owner
      ) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const message = await this.historyService.createHistory(
        createMessageDto.context,
        chatroomID,
        userID,
      );
      this.chatGateway.server.sockets.to(chatroomID).emit('message');
      return message;
    }
    const message = await this.historyService.createHistory(
      createMessageDto.context,
      chatroomID,
      user._id,
    );
    this.chatGateway.server.sockets.to(chatroomID).emit('message');
    return message;
  }

  @Get(':chatroomID/message')
  async getLatestMessage(
    @Param('chatroomID') chatroomID: string,
    @Authorization() user,
    @Headers('userID') userID: string,
  ) {
    if (!user) {
      //if user authorization fail, check if header has userID
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
}
