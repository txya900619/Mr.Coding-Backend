import { HttpModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AdminLocalStrategy } from './adminLocal.strategy';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { JwtStrategy } from './jwt.strategy';
import { LiffLocalStrategy } from './liffLocal.strategy';

config();

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JwtSecret || 'cc',
      signOptions: { expiresIn: '20d' },
    }),
    HttpModule,
  ],
  providers: [
    AuthService,
    AdminLocalStrategy,
    JwtStrategy,
    LiffLocalStrategy,
    AdminLocalStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
