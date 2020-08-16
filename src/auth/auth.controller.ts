import { Controller, UseGuards, Post, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local')) //This path is using to auth user(admin)
  @Post()
  async login(@Request() req) {
    const token = await this.authService.login(req.user);
    return { token };
  }
}
