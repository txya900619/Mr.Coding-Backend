import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Users } from './users.interface';
import { UpdateInfoDto } from './dto/update-info.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { UpdateCcDto } from './dto/update-cc.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users') private readonly usersModel: Model<Users>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Users> {
    if (this.usersModel.find({ username: createUserDto.username })) {
      return null;
    }

    createUserDto.password = hashSync(createUserDto.password, 10);
    const createdUser = new this.usersModel(createUserDto);
    await createdUser.save();

    return await this.usersModel
      .findOne({ username: createUserDto.username })
      .select('-password')
      .exec();
  }

  async findOneByUsername(username: string): Promise<Users> {
    return await this.usersModel.findOne({ username: username }).exec();
  }

  async findOneByID(id: string): Promise<Users> {
    return await this.usersModel.findOne({ _id: id }).exec();
  }

  async findOneByIDPublic(id: string): Promise<Users> {
    //This function using on API, not include password in user profile
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.usersModel
      .findOne({ _id: id })
      .select('-password')
      .exec();
  }

  async findAllPublic(): Promise<Users[]> {
    //This function using on API, not include password in all user profile
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
