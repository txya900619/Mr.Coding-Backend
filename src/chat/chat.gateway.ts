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

@WebSocketGateway()
export class ChatGateway {
  constructor(private chatService: ChatService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    // if (client.handshake.headers['userID'] != 'queryUserIDWhereData') {
    //   throw new WsException('Unauthorized access');
    // }
    client.join(data);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    let result: History;
    if (true) {
      console.log(client.rooms);
      result = await this.chatService.saveMessageToHistory(
        Object.keys(client.rooms)[1],
        data,
        'admin',
      ); //admin should replace with user
    }
    this.server.sockets
      .to(Object.keys(client.rooms)[1])
      .emit('message', result);
  }

  @SubscribeMessage('read')
  async readMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    let readMessage: History;
    try {
      readMessage = await this.chatService.readMessage(
        data,
        Object.keys(client.rooms)[1],
        'notAdmin',
      );
    } catch (e) {
      throw new WsException(e.toString());
    }
    this.server.sockets
      .to(Object.keys(client.rooms)[1])
      .emit('read', readMessage);
  }
}
