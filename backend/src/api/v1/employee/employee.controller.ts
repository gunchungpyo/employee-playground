import { Request, Response, NextFunction } from 'express';
import { getAvgSalary } from './employee.service';

/**
 * GET /api/v1/employee
 * Get average employee salary per title
 */
export const getSalaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: req params validation
    const perDate = req.query.per as string;
    const result = await getAvgSalary(perDate);
    res.json({ data: result });
  } catch (error) {
    return next(error);
  }
};
