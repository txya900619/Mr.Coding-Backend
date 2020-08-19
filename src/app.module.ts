import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoomModule } from './chatrooms/chatrooms.module';
import { HistoryModule } from './history/history.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest', {
      useFindAndModify: false,
    }),
    ChatRoomModule,
    HistoryModule,
    ChatModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
