import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import createError from 'http-errors';

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(createError(404, { name: '404', message: 'not found' }));
}

export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }
  const code = err.name || 'unknown';
  const message = err.message || 'Ops, something went wrong';
  res.status(err.status || 500);
  res.json({ code, message });
}

export function catchError(err: HttpError) {
  // if intentional error: status must already set
  if (err.status) {
    throw err;
  }
  throw createError(500, { name: 'exception', message: err.message });
}
