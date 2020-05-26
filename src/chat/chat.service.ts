import { Injectable } from '@nestjs/common';
import { HistoryService } from 'src/history/history.service';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { History } from 'src/history/history.interface';

@Injectable()
export class ChatService {
  constructor(
    private historyService: HistoryService,
    private chatroomService: ChatRoomsService,
  ) {}

  async readMessage(
    id: string,
    chatroomId: string,
    user?: string,
  ): Promise<History> {
    const message = await this.historyService.findOneByID(id);
    if (
      !message ||
      message.chatroomID !== chatroomId ||
      message.author === user
    ) {
      return null;
    }
    return await this.historyService.updateReadToTrue(id);
  }
}
