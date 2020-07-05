import { Request, Response, NextFunction } from 'express';
import { createEmployeeQueue, getEmployeeQueue } from './queue.service';

/**
 * GET /api/v1/queue
 * Get all queue list
 */
export const getQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getEmployeeQueue();
    res.json({ data: result });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/queue
 * create a queue
 */
export const createQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const start = '2010-01-01';
    const end = '2010-03-31';
    const result = await createEmployeeQueue(start, end);
    res.json({ data: result });
  } catch (error) {
    return next(error);
  }
};
