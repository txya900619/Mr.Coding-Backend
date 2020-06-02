import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';

config();

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JwtSecret || 'cc',
      signOptions: { expiresIn: '20d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtModule],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
