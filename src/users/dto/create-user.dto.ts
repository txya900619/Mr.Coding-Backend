import { userInfo } from 'os';

export class CreateUserDto {
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
  username: string;
  password: string;
  avatar: string;
  info: string;
  cc: boolean;
}
