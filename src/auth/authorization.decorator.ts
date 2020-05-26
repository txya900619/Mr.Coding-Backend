import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const Authorization = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const matches = request.headers.get('authorization').match(/(\S+)\s+(\S+)/);
    if (!matches || matches[1] !== 'bearer') {
      return null;
    }
    return jwt.verify(matches[2], 'cc');
  },
);
