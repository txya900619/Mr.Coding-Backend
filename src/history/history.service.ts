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
  async getHistoryByIDAndTime(
    id: string,
    lastTime: Date,
    number: number,
  ): Promise<History[]> {
    const history = await this.historyModel
      .find({ chatroomID: id, createdAt: { $gt: lastTime } })
      .limit(number);
    return history;
  }
}
