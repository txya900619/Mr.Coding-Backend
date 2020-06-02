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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateCcDto } from './dto/update-cc.dto';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUser(@Query('username') username: string) {
    if (!username) {
      throw new HttpException('Permission denied', HttpStatus.UNAUTHORIZED);
    } // maybe get all user
    const user = await this.usersService.findOneByUsernamePublic(username);
    if (!user) {
      return [];
    }
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/info')
  async changeInfo(
    @Param(':id') id: string,
    @Request() req,
    @Body() updateInfoDto: UpdateInfoDto,
  ) {
    if (req.user._id != id) {
      throw new HttpException('Permission denied', HttpStatus.UNAUTHORIZED);
    }
    return await this.usersService.updateInfo(id, updateInfoDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/avatar')
  async changeAvatarUrl(
    @Param(':id') id: string,
    @Request() req,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ) {
    if (req.user._id != id) {
      throw new HttpException('Permission denied', HttpStatus.UNAUTHORIZED);
    }
    return await this.usersService.updateAvatar(id, updateAvatarDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cc')
  async changeCc(
    @Param(':id') id: string,
    @Request() req,
    @Body() updateCcDto: UpdateCcDto,
  ) {
    if (req.user._id != id) {
      throw new HttpException('Permission denied', HttpStatus.UNAUTHORIZED);
    }
    return await this.usersService.updateCc(id, updateCcDto);
  }
}
