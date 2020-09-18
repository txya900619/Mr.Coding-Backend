export class CreateAdminDto {
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
  username: string;
  password: string;
  avatar: string;
  info: string;
  cc: boolean;
  admin = true;
}
