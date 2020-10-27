import { Request } from 'express';

export interface AuthorizedRequest extends Request {
  user: { _id: string; username: string };
}
