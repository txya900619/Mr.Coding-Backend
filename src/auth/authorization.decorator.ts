import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

export const Authorization = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }
    const matches = authHeader.match(/(\S+)\s+(\S+)/);
    if (!matches || matches[1] !== 'bearer') {
      return null;
    }
    return jwt.verify(matches[2], process.env.JwtSecret || 'cc');
  },
);
