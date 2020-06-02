import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History } from './history.interface';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel('History') private readonly historyModel: Model<History>,
  ) {}
  async createHistory(context: string, chatroomID: string, author: string) {
    const creatHistory = new this.historyModel({ context, chatroomID, author });
    return creatHistory.save();
  }
  async findOneByID(id: string) {
    return await this.historyModel.findOne({ _id: id }).exec();
  }
  async findByIDAndTime(
    id: string,
    lastTime: Date,
    number: number,
  ): Promise<History[]> {
    if (!number) {
      number = 0;
    }
    if (!lastTime) {
      lastTime = new Date();
    }
    const history = await this.historyModel
      .find({ chatroomID: id, createdAt: { $gt: lastTime } })
      .limit(number);
    return history;
  }
  async updateReadToTrue(id: string): Promise<History> {
    let history: History;
    try {
      history = await this.historyModel.findByIdAndUpdate(
        id,
        { read: true },
        { new: true },
      );
    } catch (e) {
      return null;
    }
    return history;
  }
}
