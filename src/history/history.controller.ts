import {
  Controller,
  Get,
  Query,
  Param,
  HttpException,
  HttpStatus,
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
  @Get(':id/history')
  async getHistory(
    @Param('id') id,
    @Query('lastTime') lastTime,
    @Query('number') number,
    @Query('userID') userID,
    @Authorization() user,
  ) {
    if (!user) {
      if (!userID) {
        throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
      }
      if (userID !== (await this.chatroomsService.findOneByID(id)).owner) {
        throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
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
