import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Users } from 'src/users/users.interface';
import { AuthService } from './auth.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(
  Strategy,
  'adminLocal',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    let user: Users;

    try {
      user = await this.authService.validateAdmin(username, password);
    } catch (error) {
      throw error;
    }
    return user;
  }
}
