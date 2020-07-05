import db from '../config/db';
import { RowDataPacket } from 'mysql';
import stream from 'stream';
import async from 'async';
import { addDays, addMonths, format, endOfMonth, differenceInCalendarDays } from 'date-fns';

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
export async function process(start: Date, end: Date) {
  await Promise.all([clearAbsenceData(start, end), clearLeaveData(start, end)]);
  console.log(new Date(), 'finish clear db');
  await Promise.all([
    genOneMonthLeave(start),
    genOneMonthLeave(addMonths(start, 1)),
    genOneMonthLeave(addMonths(start, 2))
  ]);
  console.log(new Date(), 'finish generate leave');
  await Promise.all([
    genOneMonthAbsence(start),
    genOneMonthAbsence(addMonths(start, 1)),
    genOneMonthAbsence(addMonths(start, 2))
  ]);
}

/**
 * Delete absence data
 * @param start
 * @param end
 */
export async function clearAbsenceData(start: Date, end: Date) {
  const startf = format(start, 'yyyy-MM-dd');
  const endf = format(end, 'yyyy-MM-dd');
  const sql = `
    DELETE FROM emp_absences 
    WHERE start_date >= '${startf}' and start_date  <= '${endf}';
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
export async function clearLeaveData(start: Date, end: Date) {
  const startf = format(start, 'yyyy-MM-dd');
  const endf = format(end, 'yyyy-MM-dd');
  const sql = `
    DELETE FROM emp_leaves 
    WHERE start_date >= '${startf}' and end_date  <= '${endf}';
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
export async function genOneMonthLeave(start: Date) {
  const startf = format(start, 'yyyy-MM-dd');
  const promiseDb = db.promise();
  const limit = Math.round((300024 * 10) / 100);
  const empsql = `
    SELECT emp_no, gender FROM employees
    WHERE hire_date <= '${startf}'
    ORDER BY RAND()
    LIMIT ${limit};`;
  const results = await promiseDb.query(empsql);
  const rows: RowDataPacket[] = results[0] as RowDataPacket[];
  const maxbulk = 20000; // bulk insert every 10000 rows
  let buff: any[] = [];
  for await (const row of rows) {
    const leaveType = genLeaveType(row.gender);
    const leavePeriod = genLeavePeriod(leaveType);
    const endDate = addDays(start, leavePeriod - 1);
    buff.push([row.emp_no, format(start, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), leaveType]);

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

async function genOneMonthAbsence(start: Date) {
  const end = endOfMonth(start);
  const startf = format(start, 'yyyy-MM-dd');
  const endf = format(end, 'yyyy-MM-dd');

  const promiseDb = db.promise();
  const leavesql = `
    SELECT emp_no, end_date
    FROM emp_leaves
    WHERE start_date >= '${startf}' AND end_date <= '${endf}';
  `;
  const results = await promiseDb.query(leavesql);
  const rows: RowDataPacket[] = results[0] as RowDataPacket[];
  const leaveData: any = {};
  for (let i = 0; i < rows.length; i++) {
    leaveData[rows[i].emp_no] = {
      end: rows[i].end_date
    };
  }
  console.log(new Date(), 'finish get leave');

  const q = async.queue((empNo: number, callback) => {
    const sql = 'INSERT INTO emp_absences (emp_no, start_date, end_date, break_time) VALUES ?';
    let values = [];
    if (Object.keys(leaveData).indexOf('' + empNo) > -1) {
      const newstart = addDays(leaveData[empNo].end, 1);
      values = genAbsenceByRange(empNo, newstart, end);
    } else {
      values = genAbsenceByRange(empNo, start, end);
    }
    db.query(sql, [values], (error, result) => {
      callback();
    });
  }, 100);

  q.drain(() => {
    console.log(new Date(), 'finish q');
  });

  q.error((err, task) => {
    console.error('task experienced an error', err);
  });

  const empsql = `SELECT emp_no FROM employees LIMIT 10000;`;
  db.query(empsql)
    .stream({ highWaterMark: 1024 * 16 })
    .pipe(
      new stream.Transform({
        objectMode: true,
        transform: (row, encoding, callback) => {
          q.push(row.emp_no);
          callback();
        }
      })
    )
    .on('finish', () => {
      console.log(new Date(), 'finish get employee');
    })
    .on('error', (err) => {
      console.log('err', err);
    });
}

function genAbsence(empNo: number, date: Date) {
  const target = [
    empNo,
    format(betweenHours(date, 8, 11), 'yyyy-MM-dd HH:mm:ss'),
    format(betweenHours(date, 17, 20), 'yyyy-MM-dd HH:mm:ss'),
    between(30, 90)
  ];
  return target;
}

function betweenHours(date: Date, min: number, max: number) {
  const updated = new Date(date);
  updated.setHours(between(min, max));
  return updated;
}

function genAbsenceByRange(empNo: number, from: Date, to: Date) {
  const results = [];
  const days = differenceInCalendarDays(to, from);
  for (let i = 0; i < days; i++) {
    results.push(genAbsence(empNo, addDays(from, i)));
  }
  return results;
}
