import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { History } from './history.interface';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel('History') private readonly historyModel: Model<History>,
  ) {}

  async createHistory(
    context: string,
    chatroomID: string,
    author: string,
  ): Promise<History> {
    const creatHistory = new this.historyModel({ context, chatroomID, author });
    return await creatHistory.save();
  }

  async findOneByID(id: string) {
    //This ID is history's _id auto create by mongoDB
    if (!isValidObjectId(id)) {
      return null;
    }
    return await this.historyModel.findOne({ _id: id }).exec();
  }

  async findByChatroomIDAndTime(
    chatroomID: string, //This ID is chatroom's _id auto create by mongoDB, not chatroom identify
    lastTime?: Date, //Last message timestamp, this message will not include in return data
    number?: number, //How many message want query
  ): Promise<History[]> {
    if (!number) {
      number = 0;
    }
    if (!lastTime) {
      lastTime = new Date();
    }
    const history = await this.historyModel
      .find({ chatroomID: chatroomID, createdAt: { $lt: lastTime } })
      .limit(number);
    return history;
  }

  async findLatestOne(chatroomID: string): Promise<History> {
    const history = await this.historyModel
      .findOne({ chatroomID: chatroomID })
      .sort({ _id: -1 })
      .exec();

    return history;
  }

  async readMessage(
    chatroomID: string,
    userID: string,
    lastMessageID: string,
  ): Promise<{ _id: string }[]> {
    const lastMessageCreateAt = (
      await this.historyModel.findOne({ _id: lastMessageID }).exec()
    ).createdAt;

    const updateResult = await this.historyModel
      .updateMany(
        {
          author: { $ne: userID },
          chatroomID: chatroomID,
          createdAt: { $lte: lastMessageCreateAt },
        },
        { $set: { read: true } },
        { multi: true },
      )
      .exec();

    const history = await this.historyModel
      .find({
        author: { $ne: userID },
        chatroomID: chatroomID,
        createdAt: { $lte: lastMessageCreateAt },
      })
      .select('_id')
      .sort({ _id: -1 })
      .limit(updateResult.nModified)
      .exec();

    return history;
  }

  async getLatestReadMessage(
    chatroomID: string,
    userID: string,
  ): Promise<{ _id: string }> {
    const latestReadMessage = await this.historyModel
      .findOne({ chatroomID: chatroomID, author: userID, read: true })
      .select('_id')
      .sort({ _id: -1 })
      .limit(1)
      .exec();

    return latestReadMessage;
  }
}
