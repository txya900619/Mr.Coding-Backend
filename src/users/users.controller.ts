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
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateCcDto } from './dto/update-cc.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { config } from 'dotenv';
import { AuthorizedRequest } from 'src/app.interface';
import { UsersPublic } from './users.interface';

config();
@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('adminJwt'))
  @Get() //Get all user profile, need admin authority(now all user is admin)
  async getUsers(): Promise<UsersPublic[]> {
    return await this.usersService.findAllPublic();
  }

  @Get(':id') //Get specific user profile
  async getUser(@Param('id') id: string): Promise<UsersPublic> {
    const user = await this.usersService.findOneByIDPublic(id);
    if (!user) {
      throw new HttpException(
        'not found user match this id',
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  @Post('default')
  async createDefaultUser(): Promise<UsersPublic> {
    const user = await this.usersService.createAdmin(
      new CreateAdminDto(
        process.env.DefaultAdminName,
        process.env.DefaultAdminPassword,
      ),
    );

    if (!user) {
      throw new HttpException(
        'Default user has created',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }

  @UseGuards(AuthGuard('adminJwt'))
  @Post('admin')
  async createAdmin(
    @Body() createAdminDto: CreateAdminDto,
  ): Promise<UsersPublic> {
    const user = this.usersService.createAdmin(createAdminDto);
    if (!user) {
      throw new HttpException('Username duplicate', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  @UseGuards(AuthGuard('adminJwt'))
  @Patch(':id/info') //Change user info, only self can use
  async changeInfo(
    @Param('id') id: string,
    @Request() req: AuthorizedRequest,
    @Body() updateInfoDto: UpdateInfoDto,
  ): Promise<UsersPublic> {
    if (req.user._id != id) {
      throw new HttpException(
        "You can't change other's info",
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.usersService.update(id, updateInfoDto);
  }

  @UseGuards(AuthGuard('adminJwt'))
  @Patch(':id/avatar') //Change user avatar, only self can use
  async changeAvatarUrl(
    @Param('id') id: string,
    @Request() req: AuthorizedRequest,
    @Body() updateAvatarDto: UpdateAvatarDto,
  ): Promise<UsersPublic> {
    if (req.user._id != id) {
      throw new HttpException(
        "You can't change other's avatar",
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.usersService.update(id, updateAvatarDto);
  }

  @UseGuards(AuthGuard('adminJwt'))
  @Patch(':id/cc') //Change user cc(? , only self can use
  async changeCc(
    @Param('id') id: string,
    @Request() req: AuthorizedRequest,
    @Body() updateCcDto: UpdateCcDto,
  ): Promise<UsersPublic> {
    if (req.user._id != id) {
      throw new HttpException(
        "You can't change other's cc",
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.usersService.update(id, updateCcDto);
  }
}
