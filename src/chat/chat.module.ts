import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { HistoryModule } from 'src/history/history.module';
import { ChatRoomModule } from 'src/chatrooms/chatrooms.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [HistoryModule, ChatRoomModule, UsersModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
