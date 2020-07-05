import express from 'express';
import * as employeeController from './v1/employee/employee.controller';
import * as queueController from './v1/queue/queue.controller';

const apiRouter = express.Router();
/* v1 */

// employee
apiRouter.get('/v1/employee/salary', employeeController.getSalaries);

// queue
apiRouter.get('/v1/queue', queueController.getQueue);
apiRouter.post('/v1/queue', queueController.createQueue);

export default apiRouter;
