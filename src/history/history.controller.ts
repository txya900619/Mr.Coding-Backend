import { Controller, Get, Query, Param } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('api/chatrooms')
export class HistoryController {
  constructor(private historyService: HistoryService) {}
  @Get(':id/history')
  async getHistory(
    @Param('id') id,
    @Query('lastTime') lastTime,
    @Query('number') number,
  ) {
    const history = await this.historyService.getHistoryByIDAndTime(
      id,
      lastTime,
      Number(number),
    );
    return history;
  }
}
