import IORedis from 'ioredis';
import Queue from 'bull';

const config = {
  port: parseInt(process.env.REDIS_PORT, 10),
  host: process.env.REDIS_HOST
};

const JOB_NAME = 'employee';
const client = new IORedis(config);
const subscriber = new IORedis(config);
const opts = {
  createClient: (type: string) => {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      case 'bclient':
        return new IORedis(config);
      default:
        throw new Error('Unexpected connection type: ' + type);
    }
  }
};

export const employeeQueue = new Queue(JOB_NAME, opts);
