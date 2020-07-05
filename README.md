# Employee Tools

This repo contains:
* backend: API and Worker
* web: UI using Vue.js
* [mock sql data](https://github.com/datacharmer/test_db)

## Setup

### Database using MySQL v5.7

```bash
docker run -p 3306:3306 --name my-mysql -v <your_test_db_folder>:/var/mock/test_db -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:5

# example
docker run -p 3306:3306 --name my-mysql -v ~/workspace/test_db:/var/mock/test_db -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:5

docker exec -it my-mysql bash -l
cd /var/mock/test_db
mysql -u root -p < employees.sql
```

```sql
DROP TABLE IF EXISTS emp_absences;
CREATE TABLE emp_absences (
    emp_no       INT              NOT NULL,  
    start_date   DATETIME         NOT NULL,
    end_date     DATETIME         NOT NULL,
    break_time   INT              NOT NULL,
    FOREIGN KEY (emp_no)  REFERENCES employees   (emp_no)  ON DELETE CASCADE,
    PRIMARY KEY (emp_no,start_date)
);

DROP TABLE IF EXISTS emp_leaves;
CREATE TABLE emp_leaves (
    emp_no       INT                      NOT NULL,  
    start_date   DATE                     NOT NULL,
    end_date     DATE                     NOT NULL,
    leave_type   ENUM ('A','S','M','U')   NOT NULL,    
    FOREIGN KEY (emp_no)  REFERENCES employees   (emp_no)  ON DELETE CASCADE,
    PRIMARY KEY (emp_no,start_date)
);
```

### Redis using v5
docker run -p 6379:6379 --name my-redis -d redis:5-alpine

### Backend

Copy `.env.example` as `.env`

```bash
npm install

# development
npm run watch

# build
npm run build
npm start
```

### Frontend

```bash
npm install

# development
npm run serve

# build
npm run build
```

## Usage

API usage inside `API.postman_collection.json`


## Testing

Configuration:
- leave % for each month is 5% of employee
- absences currently is set to 50000 employees

The heavy part is inserting absences, we can adjust the limit inside `backend/src/worker/employee.ts:209`


Result:
```
Processed On: 6/6/2020, 10:01:35 AM
Finished On: 6/6/2020, 10:14:23 AM
```