import IORedis from 'ioredis';
import Queue from 'bull';

const JOB_NAME = 'employee';
const client = new IORedis();
const subscriber = new IORedis();
const opts = {
  createClient: (type: string) => {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      case 'bclient':
        return new IORedis();
      default:
        throw new Error('Unexpected connection type: ' + type);
    }
  }
};

export const employeeQueue = new Queue(JOB_NAME, opts);
