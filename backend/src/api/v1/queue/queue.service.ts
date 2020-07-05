import { catchError } from '../../../common/error-handler';
import { employeeQueue } from '../../../config/bull';
import { JobStatus } from 'bull';

export async function getEmployeeQueue() {
  try {
    const types: JobStatus[] = ['completed', 'waiting', 'active', 'delayed', 'failed', 'paused'];
    const result = await employeeQueue.getJobs(types);
    return result;
  } catch (error) {
    catchError(error);
  }
}

export async function createEmployeeQueue(start: string, end: string) {
  try {
    const result = await employeeQueue.add({
      start,
      end
    });
    return result;
  } catch (error) {
    catchError(error);
  }
}
