import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoomModule } from './chatrooms/chatrooms.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/nest'), ChatRoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
