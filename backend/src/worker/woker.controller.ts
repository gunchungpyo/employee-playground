/**
 * for testing purpose
 */

import { Request, Response, NextFunction } from 'express';
import { process } from './employee';

export const testRun = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const start = '2010-01-01';
    const end = '2010-03-31';
    await process(new Date(start), new Date(end));
    res.json({ data: 'sucess' });
  } catch (error) {
    return next(error);
  }
};
