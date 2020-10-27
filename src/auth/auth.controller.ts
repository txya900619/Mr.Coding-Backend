import { Controller, UseGuards, Post, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthorizedRequest } from 'src/app.interface';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('adminLocal')) //This path is using to auth admin
  @Post('authAdmin')
  async adminLogin(
    @Request() req: AuthorizedRequest,
  ): Promise<{ token: string }> {
    const token = await this.authService.login(req.user);
    return { token };
  }

  @UseGuards(AuthGuard('liffLocal')) //This path is using to auth admin
  @Post('authLiff')
  async login(@Request() req: AuthorizedRequest): Promise<{ token: string }> {
    const token = await this.authService.login(req.user);
    return { token };
  }
}
