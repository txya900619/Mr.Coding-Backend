import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { config } from 'dotenv';
import { Users } from 'src/users/users.interface';

config();
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, unCheckPassword: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user || user.password !== unCheckPassword) {
      return null;
    }
    return user;
  }

  async login(user: Users) {
    const payload = { username: user.username, sub: user._id };
    return await this.jwtService.sign(payload);
  }
}
