import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HistoryService } from 'src/history/history.service';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { History } from 'src/history/history.interface';
import { read } from 'fs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    private historyService: HistoryService,
    private chatroomService: ChatRoomsService,
    private userService: UsersService,
  ) {}
  async saveMessageToHistory(
    id: string,
    context: string,
    author?: string,
  ): Promise<History> {
    if (!author) {
      author = (await this.chatroomService.getChatRoomById(id)).owner;
    }

    return await this.historyService.createHistory(context, id, author);
  }

  async readMessage(
    id: string,
    chatroomId: string,
    user?: string,
  ): Promise<History> {
    if (!user) {
      user = await this.findChatRoomOwnerByID(id);
    }
    if (
      !(await this.historyService.checkHistoryByChatroomIDAndUser(
        id,
        chatroomId,
        user,
      ))
    ) {
      throw new Error('chatroomID or author not match');
    }

    const readMessage = await this.historyService.readInHistoryToTrue(id);
    if (!readMessage) {
      throw new HttpException(
        `can't find message that match this id:${id}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return readMessage;
  }
  async findChatRoomOwnerByID(id: string) {
    return (await this.chatroomService.getChatRoomById(id)).owner;
  }
  async verifyUsername(username: string) {
    return await this.userService.findOneByUsername(username);
  }
}
