import { NextFunction, Request, Response } from 'express';
import cuid from 'cuid';

const HEADER_NAME = 'X-Request-ID';

export function requestTracer(req: Request, res: Response, next: NextFunction) {
  req.id = cuid();
  res.setHeader(HEADER_NAME, req.id);
  next();
}
