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
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ReadMessageDto } from './dto/read-message.dto';
import { UsersService } from 'src/users/users.service';
import { History } from './history.interface';
import { AuthGuard } from '@nestjs/passport';
import { AuthorizedRequest } from 'src/app.interface';

@Controller('api/chatrooms')
export class HistoryController {
  constructor(
    private historyService: HistoryService,
    private chatroomsService: ChatRoomsService,
    private chatGateway: ChatGateway,
    private usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':chatroomID/history') //Get history by last message's timestamp
  async getHistory(
    @Param('chatroomID') chatroomID: string, //This ID is chatroom's _id auto create by mongoDB, not chatroom identify
    @Query('lastTime') lastTime: Date, //Last message's timestamp
    @Query('number') number: number, //How many message want query
    @Req() req: AuthorizedRequest, //Authorization user's JWT
  ): Promise<History[]> {
    const userProfile = await this.usersService.findOneByID(req.user._id);
    if (!userProfile) {
      throw new UnauthorizedException();
    }
    const chatroom = await this.chatroomsService.findOneByID(chatroomID);

    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    if (chatroom.closed) {
      throw new ForbiddenException();
    }

    const history = await this.historyService.findByChatroomIDAndTime(
      chatroomID,
      lastTime,
      Number(number),
    );

    return history;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':chatroomID/message') //Add new message(history) and using socket.io to notify client that there has new message
  async createMessage(
    @Param('chatroomID') chatroomID: string,
    @Req() req: AuthorizedRequest,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<History> {
    const userProfile = await this.usersService.findOneByID(req.user._id);
    if (!userProfile) {
      throw new UnauthorizedException();
    }

    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    //Create message and notify client
    const message = await this.historyService.createHistory(
      createMessageDto.context,
      chatroomID,
      req.user._id,
    );
    this.chatGateway.server.sockets.to(chatroomID).emit('message');
    return message;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':chatroomID/message') //Get latest message in this chatroom
  async getLatestMessage(
    @Param('chatroomID') chatroomID: string,
    @Req() req: AuthorizedRequest,
  ): Promise<History> {
    const userProfile = await this.usersService.findOneByID(req.user._id);
    if (!userProfile) {
      throw new UnauthorizedException();
    }

    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    const latestMessage = await this.historyService.findLatestOne(chatroomID);
    return latestMessage;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':chatroomID/history/lastRead')
  async readMessage(
    @Param('chatroomID') chatroomID: string,
    @Body() readMessageDto: ReadMessageDto,
    @Req() req: AuthorizedRequest,
  ): Promise<{ _id: string }[]> {
    const userProfile = await this.usersService.findOneByID(req.user._id);
    if (!userProfile) {
      throw new UnauthorizedException();
    }

    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }
    if (chatroom.closed) {
      throw new ForbiddenException();
    }

    if (
      req.user._id ==
      (await this.historyService.findOneByID(readMessageDto.messageID)).author
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const readMessages = await this.historyService.readMessage(
      chatroomID,
      req.user._id,
      readMessageDto.messageID,
    );

    this.chatGateway.server.sockets.to(chatroomID).emit('read');

    return readMessages;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':chatroomID/history/lastRead')
  async getLatestReadMessageID(
    @Param('chatroomID') chatroomID: string,
    @Req() req: AuthorizedRequest,
  ): Promise<{ _id: string }> {
    const userProfile = await this.usersService.findOneByID(req.user._id);
    if (!userProfile) {
      throw new UnauthorizedException();
    }

    const chatroom = await this.chatroomsService.findOneByID(chatroomID);
    if (!userProfile.admin) {
      if (userProfile.password !== chatroom.liffUserID) {
        throw new UnauthorizedException();
      }
    }

    const latestReadMessageID = this.historyService.getLatestReadMessage(
      chatroomID,
      req.user._id,
    );

    return latestReadMessageID;
  }
}
