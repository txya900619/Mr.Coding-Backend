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
import { HttpException, HttpStatus } from '@nestjs/common';

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
      result = await this.chatService.saveMessageToHistoryAdmin(
        Object.keys(client.rooms)[0],
        data,
      ); //if admin auth pass, use guard
    } else {
      result = await this.chatService.saveMessageToHistoryOwner(
        Object.keys(client.rooms)[0],
        data,
      );
    }
    this.server.sockets
      .to(Object.keys(client.rooms)[0])
      .emit('message', result);
  }

  @SubscribeMessage('read')
  async readMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ) {
    let readMessage: History;
    try {
      readMessage = await this.chatService.readMessage(data);
    } catch (e) {
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    }
    this.server.sockets
      .to(Object.keys(client.rooms)[0])
      .emit('read', readMessage);
  }
}
