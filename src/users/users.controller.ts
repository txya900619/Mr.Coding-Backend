import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Patch,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateCcDto } from './dto/update-cc.dto';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':username')
  async getUser(@Param(':username') username: string) {
    const user = await this.usersService.findOneByUsernamePublic(username);
    if (!user) {
      throw new HttpException('this user not exist', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':username/info')
  async changeInfo(
    @Param(':username') username: string,
    @Request() req,
    @Body() updateInfoDto: UpdateInfoDto,
  ) {
    if (req.user.username != username) {
      throw new HttpException('Permission denied', HttpStatus.BAD_REQUEST);
    }
    return await this.usersService.updateInfo(username, updateInfoDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':username/avatar')
  async changeAvatarUrl(
    @Param(':username') username: string,
    @Request() req,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ) {
    if (req.user.username != username) {
      throw new HttpException('Permission denied', HttpStatus.BAD_REQUEST);
    }
    return await this.usersService.updateAvatar(username, updateAvatarDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':username/cc')
  async changeCc(
    @Param(':username') username: string,
    @Request() req,
    @Body() updateCcDto: UpdateCcDto,
  ) {
    if (req.user.username != username) {
      throw new HttpException('Permission denied', HttpStatus.BAD_REQUEST);
    }
    return await this.usersService.updateCc(username, updateCcDto);
  }
}
