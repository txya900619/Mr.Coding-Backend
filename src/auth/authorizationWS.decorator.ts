import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { ExtendedSocket } from 'src/chat/extendedSocket.interface';

config();

export const AuthorizationWS = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const client: ExtendedSocket = ctx.switchToWs().getClient();
    try {
      client.handshake.headers['Authorization'].match(/(\S+)\s+(\S+)/);
    } catch (e) {
      return null;
    }
    const matches = client.handshake.headers['Authorization'].match(
      /(\S+)\s+(\S+)/,
    );
    if (!matches || matches[1] !== 'bearer') {
      return null;
    }
    return jwt.verify(matches[2], process.env.JwtSecret || 'cc');
  },
);
