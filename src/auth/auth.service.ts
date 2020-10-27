import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
import { Users, UsersPublic } from 'src/users/users.interface';
import { compareSync } from 'bcrypt';

config();
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(
    username: string,
    unCheckPassword: string,
  ): Promise<Users> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new HttpException('Admin not found', 404);
    }
    if (!compareSync(unCheckPassword, user.password)) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async upsertLiffUserProfile(profile: {
    displayName: string;
    userId: string;
    pictureUrl: string;
    statusMessage: string;
  }): Promise<UsersPublic> {
    const user = await this.usersService.upsertLiffUser(profile);
    return user;
  }

  async login(user: { _id: string; username: string }): Promise<string> {
    const payload = { username: user.username, sub: user._id };
    return await this.jwtService.sign(payload);
  }
}
