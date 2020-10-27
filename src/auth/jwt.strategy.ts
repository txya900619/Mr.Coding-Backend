import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JwtSecret || 'cc',
    });
  }

  async validate(payload: {
    sub: string;
    username: string;
  }): Promise<{ _id: string; username: string }> {
    return { _id: payload.sub, username: payload.username };
  }
}
