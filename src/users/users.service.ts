import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from './users.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Users') private readonly usersModel: Model<Users>,
  ) {}
  async findOneByUsername(username: string): Promise<Users> {
    const user = await this.usersModel.findOne({ username: username }).exec();
    return user;
  }
}