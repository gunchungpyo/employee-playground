import stream from 'stream';

import db from '../../../config/db';

export interface AvgSalaryDB {
  salary: number;
  title: string;
}

export async function getAvgSalary(perDate: string) {
  const result: AvgSalaryDB[] = [];
  const sql = `
    SELECT AVG(s.salary) as salary, t.title
    FROM salaries s
    LEFT JOIN titles t
    ON s.emp_no = t.emp_no
    WHERE s.to_date > '${perDate}'
    AND s.from_date <= '${perDate}'
    AND t.to_date > '${perDate}'
    AND t.from_date <= '${perDate}'
    GROUP BY t.title;
  `;
  const query = db.query(sql);
  return new Promise((resolve, reject) => {
    query
      .stream({ highWaterMark: 1024 })
      .pipe(
        new stream.Transform({
          objectMode: true,
          transform: (row: AvgSalaryDB, encoding, callback) => {
            result.push(row);
            callback();
          }
        })
      )
      .on('finish', () => {
        resolve(result);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
