import { Module } from '@nestjs/common';
import { ChatRoomSchema } from './chatrooms.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoomsController } from './chatrooms.controller';
import { ChatRoomsService } from './chatrooms.service';
import { HistoryModule } from 'src/history/history.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ChatRoom', schema: ChatRoomSchema }]),
    HistoryModule,
  ],
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
})
export class ChatRoomModule {}
