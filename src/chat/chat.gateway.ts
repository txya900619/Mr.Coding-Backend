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
import { Authorization } from 'src/auth/authorization.decorator';
import { ChatRoomsService } from 'src/chatrooms/chatrooms.service';
import { UsersService } from 'src/users/users.service';
import { ExtendedSocket } from './extendedSocket.interface';
import { HistoryService } from 'src/history/history.service';
import { compare } from 'bcrypt';

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

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: string,
    @ConnectedSocket() client: ExtendedSocket,
    @Authorization() user: any,
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
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: ExtendedSocket,
  ) {
    if (Object.keys(client.rooms).length === 1) {
      throw new WsException('should join room');
    }

    const result = await this.historyService.createHistory(
      Object.keys(client.rooms)[1],
      data,
      client.userID,
    );

    this.server.sockets
      .to(Object.keys(client.rooms)[1])
      .emit('message', result);
  }

  @SubscribeMessage('read')
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
