import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { Authorization } from 'src/auth/authorization.decorator';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';

@Controller('api/chatrooms')
export class HistoryController {
  constructor(
    private historyService: HistoryService,
    private chatroomsService: ChatRoomsService,
  ) {}

  @Get(':chatroomID/history') //Get history by last message's timestamp
  async getHistory(
    @Param('chatroomID') id: string, //This ID is chatroom's _id auto create by mongoDB, not chatroom identify
    @Query('lastTime') lastTime: Date, //Last message's timestamp
    @Query('number') number: number, //How many message want query
    @Headers('userid') userID: string, //Common user's line user_id
    @Authorization() user, //Authorization user's JWT
  ) {
    if (!user) {
      //if user authorization fail, check if header has userid
      if (!userID) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (userID !== (await this.chatroomsService.findOneByID(id)).owner) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    }
    const history = await this.historyService.findByIDAndTime(
      id,
      lastTime,
      Number(number),
    );

    return history;
  }
}
