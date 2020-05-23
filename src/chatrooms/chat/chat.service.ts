import { Injectable } from '@nestjs/common';
import { HistoryService } from 'src/history/history.service';
import { ChatRoomsService } from '../chatrooms.service';
import { History } from 'src/history/history.interface';

@Injectable()
export class ChatService {
  constructor(
    private historyService: HistoryService,
    private chatroomService: ChatRoomsService,
  ) {}
  async saveMessageToHistoryOwner(
    id: string,
    context: string,
  ): Promise<History> {
    return await this.historyService.createHistory(
      context,
      id,
      (await this.chatroomService.getChatRoomById(id)).owner,
    );
  }
  async saveMessageToHistoryAdmin(
    id: string,
    context: string,
  ): Promise<History> {
    return await this.historyService.createHistory(context, id, 'admin');
  }
  async readMessage(id: string): Promise<History> {
    return await this.historyService.readInHistoryToTrue(id);
  }
}
