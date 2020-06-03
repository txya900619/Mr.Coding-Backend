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

  async findOneByID(id: string): Promise<Users> {
    return await this.usersModel.findOne({ _id: id }).exec();
  }

  async findOneByIDPublic(id: string): Promise<Users> {
    return await this.usersModel
      .findOne({ _id: id })
      .select('-password')
      .exec();
  }

  async findAllPublic(): Promise<Users[]> {
    return await this.usersModel
      .find()
      .select('-password')
      .exec();
  }

  async updateInfo(id: string, info: UpdateInfoDto): Promise<Users> {
    return await this.usersModel
      .findByIdAndUpdate(id, info, { new: true })
      .select('-password')
      .exec();
  }

  async updateAvatar(id: string, avatar: UpdateAvatarDto): Promise<Users> {
    return await this.usersModel
      .findByIdAndUpdate(id, avatar, { new: true })
      .select('-password')
      .exec();
  }

  async updateCc(id: string, cc: UpdateCcDto): Promise<Users> {
    return await this.usersModel
      .findByIdAndUpdate(id, cc, {
        new: true,
      })
      .select('-password')
      .exec();
  }
}
