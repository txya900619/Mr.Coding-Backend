import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users/users.service';
import { UsersPublic } from './users/users.interface';
import { AuthorizedRequest } from './app.interface';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Get() //Local API test
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('api/me') //Get admin profile
  async getMe(@Req() req: AuthorizedRequest): Promise<UsersPublic> {
    return await this.usersService.findOneByIDPublic(req.user._id);
  }
}
