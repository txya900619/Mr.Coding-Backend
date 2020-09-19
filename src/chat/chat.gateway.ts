import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { UsersService } from 'src/users/users.service';
import { ExtendedSocket } from './extendedSocket.interface';
import { AuthorizationWS } from 'src/auth/authorizationWS.decorator';
@WebSocketGateway()
export class ChatGateway {
  constructor(
    private chatroomsService: ChatRoomsService,
    private usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join') //Join the socket.io's room by chatroom's _id
  async handleJoin(
    @MessageBody() data: string, //chatroom's _id
    @ConnectedSocket() client: ExtendedSocket,
    @AuthorizationWS() user: any,
  ) {
    if (!user) {
      throw new WsException('Unauthorized access');
    } else {
      const userProfile = await this.usersService.findOneByID(user._id);
      if (!userProfile) {
        throw new WsException('Unauthorized access');
      }
      if (!userProfile.admin) {
        const chatroom = await this.chatroomsService.findOneByID(data);
        if (chatroom.liffUserID != userProfile.password) {
          throw new WsException('Unauthorized access');
        }
      }
    }
    client.join(data);
    client.emit(
      'successfullyJoinedChatRoomOfMrCodingPlatformInNationalTaipeiUniversityOfTechnologyProgrammingClub',
    );
  }
}
