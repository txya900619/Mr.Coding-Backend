import { Controller, UseGuards, Post, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(AuthGuard('local'))
  @Post()
  async login(@Request() req) {
    const token = this.authService.login(req.user);
    return { token };
  }
}
