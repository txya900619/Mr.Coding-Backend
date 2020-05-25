import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/users/users.interface';

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
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_token: this.jwtService.sign(payload),
    };
  }
}
