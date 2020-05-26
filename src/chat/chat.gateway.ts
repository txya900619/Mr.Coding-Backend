import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { History } from 'src/history/history.interface';
import { Authorization } from 'src/auth/authorization.decorator';

@WebSocketGateway()
export class ChatGateway {
  constructor(private chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
    @Authorization() user: any,
  ) {
    if (!user) {
      if (!client.handshake.headers['userID']) {
        throw new WsException('Unauthorized access');
      }
      if (
        client.handshake.headers['userID'] !==
        this.chatService.findChatRoomOwnerByID(data)
      ) {
        throw new WsException('Unauthorized access');
      }
    } else {
      if (!this.chatService.verifyUsername(user.username)) {
        throw new WsException('Unauthorized access');
      }
    }
    client.join(data);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
    @Authorization() user: any,
  ) {
    if (Object.keys(client.rooms).length === 1) {
      throw new WsException('should join room');
    }
    let result: History;
    if (user) {
      result = await this.chatService.saveMessageToHistory(
        Object.keys(client.rooms)[1],
        data,
        user.username,
      ); //admin should replace with user
    } else {
      result = await this.chatService.saveMessageToHistory(
        Object.keys(client.rooms)[1],
        data,
      );
    }
    this.server.sockets
      .to(Object.keys(client.rooms)[1])
      .emit('message', result);
  }

  @SubscribeMessage('read')
  async readMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
    @Authorization() user: any,
  ) {
    if (Object.keys(client.rooms).length === 1) {
      throw new WsException('should join room');
    }
    let readMessage: History;
    try {
      if (user) {
        readMessage = await this.chatService.readMessage(
          data,
          Object.keys(client.rooms)[1],
          user.username,
        );
      } else {
        readMessage = await this.chatService.readMessage(
          data,
          Object.keys(client.rooms)[1],
        );
      }
    } catch (e) {
      throw new WsException(e.toString());
    }
    this.server.sockets
      .to(Object.keys(client.rooms)[1])
      .emit('read', readMessage);
  }
}
