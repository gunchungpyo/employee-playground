import express from 'express';
import { Request, Response } from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';

import { ENVIRONMENT } from './util/secrets';
import apiRouter from './api/api.controller';

import { errorHandler, notFoundHandler } from './common/error-handler';
import { requestTracer } from './middleware/request-tracer';
import { employeeQueue } from './config/bull';
import db from './config/db';

import { process } from './worker/employee';

// Create Express server
const app = express();
app.set('app env', ENVIRONMENT);

// connect to database
db.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
  if (error) {
    console.error('Something went wrong with db:', error);
  }
  console.log('Database client connected');
});

// Express configuration
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(requestTracer);

/**
 * Primary app routes.
 */
app.get('/healthcheck', (req: Request, res: Response) => {
  res.send('OK');
});

app.use('/api', apiRouter);

// error area
app.use(notFoundHandler);
app.use(errorHandler);

// worker area
employeeQueue.process(async (job) => {
  const startDate = new Date(job.data.start);
  const endDate = new Date(job.data.end);
  await process(startDate, endDate);
});

export default app;
