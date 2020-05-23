import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
  async readInHistoryToTrue(id: string): Promise<History> {
    let history: History;
    try {
      history = await this.historyModel.findByIdAndUpdate(id, { read: true });
    } catch (e) {
      throw new Error(`can't find message that match this id:${id}`);
    }
    return history;
  }
}
