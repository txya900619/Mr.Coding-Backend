import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'adminJwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JwtSecret || 'cc',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneByID(payload.sub);
    if (!user.admin) {
      throw new UnauthorizedException();
    }
    return { _id: payload.sub, username: payload.username };
  }
}
