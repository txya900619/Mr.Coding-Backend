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
import { HistoryService } from 'src/history/history.service';
import { AuthorizationWS } from 'src/auth/authorizationWS.decorator';
@WebSocketGateway()
export class ChatGateway {
  constructor(
    private chatroomsService: ChatRoomsService,
    private usersService: UsersService,
    private historyService: HistoryService,
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
      if (!client.handshake.headers['userID']) {
        throw new WsException('Unauthorized access');
      }
      const chatroom = await this.chatroomsService.findOneByID(data);

      if (client.handshake.headers['userID'] !== chatroom.owner) {
        throw new WsException('Unauthorized access');
      } // check user_id
      client.userID = client.handshake.headers['userID'];
    } else {
      if (!(await this.usersService.findOneByID(user._id))) {
        throw new WsException('Unauthorized access');
      }
      client.userID = user._id;
    }
    client.join(data);
    client.emit(
      'successfullyJoinedChatRoomOfMrCodingPlatformInNationalTaipeiUniversityOfTechnologyProgrammingClub',
    );
  }
}
