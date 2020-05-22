import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRoomsService } from './chatrooms.service';
import { History } from 'src/history/history.interface';

@WebSocketGateway()
export class ChatRoomGateway {
  constructor(private chatroomsService: ChatRoomsService) {}
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
      result = await this.chatroomsService.saveMessageToHistoryAdmin(
        Object.keys(client.rooms)[0],
        data,
      ); //if admin auth pass, use guard
    } else {
      result = await this.chatroomsService.saveMessageToHistoryOwner(
        Object.keys(client.rooms)[0],
        data,
      );
    }
    this.server.sockets
      .to(Object.keys(client.rooms)[0])
      .emit('message', result);
  }
}
