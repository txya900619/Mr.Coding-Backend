import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { HistoryModule } from 'src/history/history.module';
import { ChatRoomModule } from 'src/chatrooms/chatrooms.module';
import { ChatService } from './chat.service';

@Module({
  imports: [HistoryModule, ChatRoomModule],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
