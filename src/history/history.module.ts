import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistorySchema } from './history.schema';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { ChatRoomModule } from 'src/chatrooms/chatrooms.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'History', schema: HistorySchema }]),
    ChatRoomModule,
  ],
  controllers: [HistoryController],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
