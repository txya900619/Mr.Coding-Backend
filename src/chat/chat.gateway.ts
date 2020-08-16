import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { UsersService } from 'src/users/users.service';
import { ExtendedSocket } from './extendedSocket.interface';
import { HistoryService } from 'src/history/history.service';
import { compare } from 'bcrypt';
import { AuthorizationWS } from 'src/auth/authorizationWS.decorator';
@WebSocketGateway()
export class ChatGateway {
  constructor(
    private chatService: ChatService,
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

      if (
        !(await compare(client.handshake.headers['userID'], chatroom.owner))
      ) {
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

  @SubscribeMessage('message') //TODO: should delete this subscribe, because should use RESTful API to create new message
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: ExtendedSocket,
  ) {
    if (Object.keys(client.rooms).length === 1) {
      throw new WsException('should join room');
    }

    const result = await this.historyService.createHistory(
      data,
      Object.keys(client.rooms)[1],
      client.userID,
    );

    this.server.sockets
      .to(Object.keys(client.rooms)[1])
      .emit('message', result); //TODO: change this event to alarm client there has new message, so it should not take message body
  }

  @SubscribeMessage('read') //TODO: change read service from read all to split a small piece, maybe use RESTful API let client get which message read
  async readMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: ExtendedSocket,
  ) {
    if (Object.keys(client.rooms).length === 1) {
      throw new WsException('should join room');
    }
    const readMessage = await this.chatService.readMessage(
      data,
      Object.keys(client.rooms)[1],
      client.userID,
    );
    if (!readMessage) {
      throw new WsException(
        "this account can't read this message or can't find message",
      );
    }

    this.server.sockets
      .to(Object.keys(client.rooms)[1])
      .emit('read', readMessage);
  }
}
