import db from '../config/db';
import { RowDataPacket } from 'mysql';
import { addDays, addMonths, format } from 'date-fns';

/**
 * Employee worker steps:
 * 1. Pre processing - ok
 * 2. Generate leave - ok
 * 3. Generate absence
 * 4. Update latest salary
 */

/**
 * Pre processing step
 * @param start
 * @param end
 */
export async function process(start: string, end: string) {
  console.log(`preProcess start with params start ${start} and end ${end}`);
  const startDate = new Date(start);
  await Promise.all([clearLeaveData(start, end), clearAbsenceData(start, end)]);
  console.log('finished clear db');
  await Promise.all([
    genOneMonthLeave(start),
    genOneMonthLeave(format(addMonths(startDate, 1), 'yyyy-MM-dd')),
    genOneMonthLeave(format(addMonths(startDate, 2), 'yyyy-MM-dd'))
  ]);
  console.log('finished insert db');
}

/**
 * Delete absence data
 * @param start
 * @param end
 */
export async function clearAbsenceData(start: string, end: string) {
  console.log(`clearAbsenceData start with params start ${start} and end ${end}`);
  const sql = `
    DELETE FROM emp_absences 
    WHERE start_date >= '${start}' and start_date  <= '${end}';
  `;

  try {
    const promiseDb = db.promise();
    await promiseDb.query(sql);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete Leave Data
 * @param start
 * @param end
 */
export async function clearLeaveData(start: string, end: string) {
  console.log(`clearLeaveData start with params start ${start} and end ${end}`);
  const sql = `
    DELETE FROM emp_leaves 
    WHERE start_date >= '${start}' and end_date  <= '${end}';
  `;
  try {
    const promiseDb = db.promise();
    await promiseDb.query(sql);
  } catch (error) {
    throw error;
  }
}

/**
 * Leave Type
 */
enum LeaveType {
  Annual = 'A', // 1-4 days = 1
  Sick = 'S', // 1-3 days = 2
  Unpaid = 'U', // 14-25 days = 3
  Maternity = 'M' // 10-14 days = 4
}

function genLeaveType(gender: string) {
  let maxType = 3;
  if (gender === 'F') {
    maxType = maxType + 1;
  }
  const typeIdx = between(1, maxType);
  switch (typeIdx) {
    case 1:
      return LeaveType.Annual;
    case 2:
      return LeaveType.Sick;
    case 3:
      return LeaveType.Unpaid;
    case 4:
      return LeaveType.Maternity;
    default:
      return LeaveType.Annual;
  }
}

function genLeavePeriod(type: LeaveType) {
  switch (type) {
    case LeaveType.Annual:
      return between(1, 4);
    case LeaveType.Sick:
      return between(1, 3);
    case LeaveType.Unpaid:
      return between(14, 25);
    case LeaveType.Maternity:
      return between(10, 14);
    default:
      return 1;
  }
}

function between(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Generate leave data for 1 month
 * @param start
 */
export async function genOneMonthLeave(start: string) {
  const promiseDb = db.promise();
  const limit = Math.round((300024 * 10) / 100);
  const empsql = `
    SELECT emp_no, gender FROM employees
    WHERE hire_date <= '${start}'
    LIMIT ${limit};`;
  const results = await promiseDb.query(empsql);
  const rows: RowDataPacket[] = results[0] as RowDataPacket[];
  const maxbulk = 20000; // bulk insert every 10000 rows
  let buff: any = [];
  for await (const row of rows) {
    const leaveType = genLeaveType(row.gender);
    const leavePeriod = genLeavePeriod(leaveType);
    const startDate = new Date(start);
    const endDate = addDays(startDate, leavePeriod - 1);
    buff.push([row.emp_no, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), leaveType]);

    if (buff.length % maxbulk === 0) {
      await insertLeaveBulk(buff);
      buff = [];
    }
  }

  if (buff.length > 0) {
    await insertLeaveBulk(buff);
  }
}

async function insertLeaveBulk(bulk: any) {
  const sql = 'INSERT INTO emp_leaves (emp_no, start_date, end_date, leave_type) VALUES ?';
  const promiseDb = db.promise();
  await promiseDb.query(sql, [bulk]);
}
