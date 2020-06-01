import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from './users.interface';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateCcDto } from './dto/update-cc.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users') private readonly usersModel: Model<Users>,
  ) {}
  async findOneByUsername(username: string): Promise<Users> {
    return await this.usersModel.findOne({ username: username }).exec();
  }
  async findOneByUsernamePublic(username: string): Promise<Users> {
    return await this.usersModel
      .findOne({ username: username })
      .populate('-password', '-_id')
      .exec();
  }
  async updateInfo(username: string, info: UpdateInfoDto): Promise<Users> {
    return await this.usersModel.findOneAndUpdate(
      { username: username },
      info,
      { new: true },
    );
  }

  async updateAvatar(
    username: string,
    avatar: UpdateAvatarDto,
  ): Promise<Users> {
    return await this.usersModel.findOneAndUpdate(
      { username: username },
      avatar,
      { new: true },
    );
  }

  async updateCc(username: string, cc: UpdateCcDto): Promise<Users> {
    return await this.usersModel.findOneAndUpdate({ username: username }, cc, {
      new: true,
    });
  }
}
