import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { HistoryModule } from 'src/history/history.module';
import { ChatRoomModule } from '../chatrooms.module';

@Module({
  imports: [HistoryModule, ChatRoomModule],
  providers: [ChatGateway],
})
export class ChatModel {}
