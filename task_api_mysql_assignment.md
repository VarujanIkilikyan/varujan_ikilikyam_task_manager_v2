# Task API Assignment - Node.js + Express + MySQL2 (express-app architecture)

## Overview
Create a RESTful API for managing a to-do list using **Node.js (ESM)**, **Express 5**, and **mysql2/promise**.
The project structure, naming, validation library, token mechanism and password hashing **must follow the existing `express-app` architecture** exactly (see "Project Structure" and "Dependencies" sections below).

> Important: this homework keeps the same conventions used in `express-app`:
> - ES Modules (`"type": "module"`, `import / export`)
> - `mysql2` with `.promise()` pool/connection (see `clients/db.mysql.js`)
> - **Joi** for validation (NOT RegExp / NOT Yup)
> - **crypto-js** AES for tokens (NOT `jsonwebtoken`)
> - **md5** double-hash with `PASSWORD_SECRET` for passwords (NOT bcrypt)
> - **http-errors** for thrown errors
> - **lodash** utilities (`_.head`, `_.get`, `_.set`, `_.isEmpty`, …)
> - **morgan** for request logging
> - **moment** for date handling
> - `migrate.js` imported from `app.js` for table bootstrap

---

## Database Setup

### Database Schema (must be created from `migrate.js`)
```sql
-- users table (already exists in express-app, reuse the same shape)
CREATE TABLE IF NOT EXISTS users (
  id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  name     VARCHAR(30),
  age      INT,
  email    VARCHAR(255) UNIQUE,
  password VARCHAR(255)
);

-- tasks: main table
CREATE TABLE IF NOT EXISTS tasks (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  completed   BOOLEAN DEFAULT FALSE,
  task_date   DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- task_details: 1-to-1 extension of a task
-- Mirrors the products / product_address pattern from the SQL JOIN example.
CREATE TABLE IF NOT EXISTS task_details (
  id          BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id     BIGINT NOT NULL,
  priority    ENUM('low', 'medium', 'high') DEFAULT 'medium',
  location    VARCHAR(255),
  notes       TEXT
);
```

All three tables (`users`, `tasks`, `task_details`) **must be created inside `migrate.js`** using `DbMysql.query(...)` with `create table if not exists ...` — same style as the existing users migration. No foreign keys, no extra indexes — keep the migration as simple as possible.

---

## API Requirements

### Authentication Endpoints
Already present in `express-app` — keep the same contracts:

- `POST /users/register` — register user (Joi schema, md5 hashed password)
- `POST /users/login` — login, returns `{ token, user }` where `token` is AES encrypted via `Users.encrypt(...)`
- `GET  /users/profile` — protected by `authorization` middleware
- `PUT  /users/profile` — protected, updates name/age
- `GET  /users/list` — protected, paginated

(Do not change these endpoints; you only extend the project with tasks.)

### Task Endpoints (all protected by `authorization` middleware)

#### 1. Create Task
- **POST** `/tasks`
- **Headers:** `Authorization: <encrypted_token>` (same scheme as `express-app` — the token is sent **raw** in `Authorization` header, not as `Bearer ...`. See `middlewares/authorization.js`.)
- **Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "taskDate": "2026-06-01",
  "details": {
    "priority": "high",
    "location": "Yerevan",
    "notes": "Closes at 22:00"
  }
}
```
- `details` is **optional**. If provided, a row is inserted into `task_details` for that task.
- **Response 201:**
```json
{
  "task": {
    "id": 12,
    "userId": 3,
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": false,
    "taskDate": "2026-06-01",
    "details": {
      "priority": "high",
      "location": "Yerevan",
      "notes": "Closes at 22:00"
    }
  }
}
```

#### 2. Get All Tasks (paginated) — **LEFT JOIN**
- **GET** `/tasks?page=1&limit=10`
- Returns all tasks of the authenticated user, joined with `task_details` using **LEFT JOIN** (so tasks that have no details are still returned, with `details = null`).
- **Response:**
```json
{
  "result": [
    {
      "id": 12,
      "user_id": 3,
      "title": "Buy groceries",
      "description": "Milk, bread, eggs",
      "completed": 0,
      "task_date": "2026-06-01",
      "details": {
        "priority": "high",
        "location": "Yerevan",
        "notes": "Closes at 22:00"
      }
    },
    {
      "id": 13,
      "user_id": 3,
      "title": "Read a book",
      "description": null,
      "completed": 0,
      "task_date": "2026-06-02",
      "details": null
    }
  ],
  "count": 2,
  "page": 1,
  "offset": 0
}
```

#### 3. Get Tasks With Details Only — **INNER JOIN**
- **GET** `/tasks/with-details?page=1&limit=10`
- Returns **only** tasks of the authenticated user that have a matching row in `task_details` (use **INNER JOIN**).
- Same response shape as `GET /tasks`, but `details` is never `null`.

#### 4. Get Task by ID
- **GET** `/tasks/:id`
- Use **LEFT JOIN** with `task_details`. Return 404 if the task does not belong to the current user.

#### 5. Update Task
- **PUT** `/tasks/:id`
- Update task fields, and if `details` is provided in the body, **upsert** the matching `task_details` row (insert if missing, otherwise update).
- Validate ownership: a user can only update their own tasks.

#### 6. Delete Task
- **DELETE** `/tasks/:id`
- Inside the model, delete the matching row from `task_details` first (by `task_id`), then delete the task itself.
- Response: `{ "message": "Թասկը հեռացված է" }`

---

## NEW: SQL JOINs section (REQUIRED)

This part of the homework teaches the same pattern as the reference query:

```sql
-- Reference (products / product_address):
SELECT
  p.*,
  pD.address AS p_address
FROM products p
INNER JOIN product_address pD ON p.id = pD.product_id;
```

You must implement two **task** queries that follow the same shape, and expose them as the two endpoints described above.

### Required Query #1 — INNER JOIN (only tasks that have details)
Used by `GET /tasks/with-details`:
```sql
SELECT
  t.*,
  tD.priority AS t_priority,
  tD.location AS t_location,
  tD.notes    AS t_notes
FROM tasks t
INNER JOIN task_details tD ON t.id = tD.task_id
WHERE t.user_id = ?
ORDER BY t.task_date ASC
LIMIT ? OFFSET ?;
```

### Required Query #2 — LEFT JOIN (all tasks, details optional)
Used by `GET /tasks` and `GET /tasks/:id`:
```sql
SELECT
  t.*,
  tD.priority AS t_priority,
  tD.location AS t_location,
  tD.notes    AS t_notes
FROM tasks t
LEFT JOIN task_details tD ON t.id = tD.task_id
WHERE t.user_id = ?
ORDER BY t.task_date ASC
LIMIT ? OFFSET ?;
```

### Mapping rules (mandatory)
Inside `models/tasks.js`, when mapping rows from the JOIN you **must** transform the flat row into a nested `details` object before returning to the controller, for example:

```js
function mapRow(row) {
  if (!row) return null;
  const {
    t_priority, t_location, t_notes,
    ...task
  } = row;

  const hasDetails = t_priority !== null && t_priority !== undefined;

  return {
    ...task,
    details: hasDetails
      ? { priority: t_priority, location: t_location, notes: t_notes }
      : null,
  };
}
```

### Counting with JOIN
For pagination metadata you must also write a count query that uses the same JOIN strategy:

```sql
-- Count for INNER JOIN endpoint
SELECT COUNT(*) AS count
FROM tasks t
INNER JOIN task_details tD ON t.id = tD.task_id
WHERE t.user_id = ?;

-- Count for LEFT JOIN endpoint
SELECT COUNT(*) AS count
FROM tasks t
WHERE t.user_id = ?;
```

### What we are checking
- You understand the difference between INNER JOIN and LEFT JOIN.
- You use **table aliases** (`t`, `tD`) and **column aliases** (`tD.priority AS t_priority`) the same way the reference query does.
- You use **prepared statements** (`?` placeholders), not string concatenation.
- You sort by `task_date ASC` and paginate with `LIMIT ? OFFSET ?`.
- You convert the flat JOIN result into a nested `{ ..., details: { ... } | null }` shape in the model layer (controller only consumes already-mapped objects).

---

## Business Logic
1. **Cannot create tasks with past dates** — validate `taskDate` >= today using `moment`.
2. **Maximum 3 tasks per day per user** — before insert, run a count query for `(user_id, task_date)`; if `>= 3` throw `HttpErrors(422)`.
3. **Tasks sorted by `task_date` ASC** in every list endpoint.
4. **Pagination** — `?page` (default 1) and `?limit` (default 10, max 50). Reuse the same shape as `Users.getUsersList` → return `{ result, count, page, offset }`.
5. **User isolation** — every query is scoped by `req.userId` (set by `authorization` middleware). A user MUST NOT be able to read/update/delete another user's task.

---

## Validation (Joi)

Add `middlewares/schemas/tasks.schema.js` (mirror `users.schema.js`):

```js
import Joi from 'joi';

const detailsSchema = Joi.object({
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  location: Joi.string().max(255).allow('', null),
  notes:    Joi.string().max(1000).allow('', null),
});

export default {
  create: Joi.object({
    title:       Joi.string().min(3).max(255).required(),
    description: Joi.string().max(1000).allow('', null),
    taskDate:    Joi.date().iso().required(),
    details:     detailsSchema.optional(),
  }),

  update: Joi.object({
    title:       Joi.string().min(3).max(255),
    description: Joi.string().max(1000).allow('', null),
    completed:   Joi.boolean(),
    taskDate:    Joi.date().iso(),
    details:     detailsSchema.optional(),
  }).min(1),

  list: Joi.object({
    page:  Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(5).max(50).default(10),
  }),

  idParam: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
```

Use the existing `middlewares/validation.js` helper exactly the way it is used in `routes/users.js`:
```js
validation(schema.create, 'body')
validation(schema.list,   'query')
validation(schema.idParam,'params')
```

> Do **not** introduce a RegExp-based `validation.js` — `express-app` uses Joi.

---

## Authentication
Reuse the existing pieces — do **not** add JWT, bcrypt or native `crypto`:
- `models/users.js` already exports `encrypt`, `decrypt`, `hashPassword` (md5 + secret).
- `middlewares/authorization.js` already:
  - reads the raw token from `req.headers.authorization`
  - decrypts it with `Users.decrypt(token)`
  - checks `expiresIn` with `moment`
  - sets `req.userId`

Task routes simply use `authorization` as middleware, exactly like `/users/profile` does.

---

## Project Structure (must match exactly)

```
express-app/
├── app.js
├── migrate.js                      # add tasks + task_details tables here
├── .env / .env.example
├── package.json
│
├── clients/
│   └── db.mysql.js                 # existing — DO NOT change the export shape
│
├── models/
│   ├── users.js                    # existing
│   └── tasks.js                    # NEW
│
├── controllers/
│   ├── users.js                    # existing
│   └── tasks.js                    # NEW
│
├── routes/
│   ├── index.js                    # add `router.use('/tasks', tasksRouter)`
│   ├── users.js                    # existing
│   └── tasks.js                    # NEW
│
└── middlewares/
    ├── authorization.js            # existing, reuse as-is
    ├── validation.js               # existing, reuse as-is
    ├── errorHandler.js             # existing
    └── schemas/
        ├── users.schema.js         # existing
        └── tasks.schema.js         # NEW
```

---

## Model Layer — `models/tasks.js`

Must follow the same style as `models/users.js`:
- Named exports + a default export object.
- All queries via `DbMysql.query(...)` with `?` placeholders.
- Use `lodash` helpers (`_.head`, `_.get`, `_.isEmpty`).
- Always return either a mapped object/array or `null` on error.
- `console.error(error)` in catch blocks (same convention).

**Required functions:**

- `create({ userId, title, description, taskDate, details })`
  - Insert into `tasks`. If `details` is given, also insert into `task_details`.
  - Return the freshly created task via `findById(insertId, userId)` (which uses LEFT JOIN).
- `findById(id, userId)` — LEFT JOIN, scoped by `user_id`, returns mapped object or `null`.
- `getList(userId, page = 1, limit = 10)` — LEFT JOIN + count, returns `{ result, count, page, offset }`.
- `getListWithDetails(userId, page = 1, limit = 10)` — INNER JOIN + count, same shape.
- `countByDate(userId, taskDate)` — used by the "max 3 per day" rule.
- `update(id, userId, data)` — update task fields, upsert `task_details` if `data.details` is provided. Return updated task via `findById`.
- `remove(id, userId)` — first `DELETE FROM task_details WHERE task_id = ?`, then `DELETE FROM tasks WHERE id = ? AND user_id = ?`. Return boolean.

The mapping helper (`mapRow`) described in the JOINs section is private to the model.

---

## Controller — `controllers/tasks.js`

Same shape as `controllers/users.js` (default-exported object of async handlers, each one wrapped in try/catch and calling `next(e)` on error).

Required handlers:
- `create(req, res, next)` — validates date, enforces "max 3 per day", calls `Tasks.create(...)`.
- `list(req, res, next)` — calls `Tasks.getList(req.userId, page, limit)`.
- `listWithDetails(req, res, next)` — calls `Tasks.getListWithDetails(...)`.
- `getById(req, res, next)` — 404 via `HttpErrors(404)` when not found.
- `update(req, res, next)` — 404 if not found, otherwise return updated task.
- `remove(req, res, next)` — return `{ message: 'Թասկը հեռացված է' }`.

Throw with `http-errors`, e.g.:
```js
throw new HttpErrors(422, { errors: { taskDate: 'Task date cannot be in the past' } });
```

---

## Routes — `routes/tasks.js`

```js
import { Router } from 'express';
import controller from '../controllers/tasks.js';
import validation from '../middlewares/validation.js';
import schema from '../middlewares/schemas/tasks.schema.js';
import authorization from '../middlewares/authorization.js';

const router = Router();

router.use(authorization); // every task route is protected

router.get('/',              validation(schema.list, 'query'),                                controller.list);
router.get('/with-details',  validation(schema.list, 'query'),                                controller.listWithDetails);
router.get('/:id',           validation(schema.idParam, 'params'),                            controller.getById);
router.post('/',             validation(schema.create, 'body'),                               controller.create);
router.put('/:id',           validation(schema.idParam, 'params'), validation(schema.update, 'body'), controller.update);
router.delete('/:id',        validation(schema.idParam, 'params'),                            controller.remove);

export default router;
```

Then in `routes/index.js`:
```js
import tasksRouter from './tasks.js';
...
router.use('/tasks', tasksRouter);
```

---

## Migration — `migrate.js`

Extend the existing `migrate.js` (do **not** rewrite the file from scratch — keep the users migration and just append the two new `create table if not exists` calls). Log each step the same way the existing migration logs `-> User table successfully created`.

---

## Environment Variables (.env)

Reuse `express-app/.env.example` as-is. No new variables are required for this homework.

```env
PORT=3001
PASSWORD_SECRET=
TOKEN_SECRET=

MY_SQL_HOST=
MY_SQL_PORT=
MY_SQL_USER=
MY_SQL_PASSWORD=
MY_SQL_DATABASE=
```

---

## Dependencies

Already present in `express-app/package.json` — do **not** add bcrypt / jsonwebtoken / express-validator / sequelize / knex / typeorm:

```
express ^5.2
mysql2  ^3.22
crypto-js ^4.2
http-errors ^2.0
joi ^18.1
lodash ^4
md5 ^2.3
moment ^2.30
morgan ^1.10
uuid ^14   (not required for tasks since IDs are BIGINT AUTO_INCREMENT, but already in package.json)
```

---

## Testing Checklist

### Auth (regression)
- [ ] Existing `/users/register`, `/users/login`, `/users/profile`, `/users/list` still work after your changes.

### Tasks
- [ ] `POST /tasks` creates a task without `details` (row is in `tasks` only).
- [ ] `POST /tasks` creates a task with `details` (rows in both `tasks` and `task_details`).
- [ ] `POST /tasks` returns 422 when `taskDate` is in the past.
- [ ] `POST /tasks` returns 422 when the user already has 3 tasks on that date.
- [ ] `GET /tasks` returns tasks of the current user only (sorted by `task_date ASC`, paginated, LEFT JOIN — includes tasks with `details: null`).
- [ ] `GET /tasks/with-details` returns only tasks that have a matching `task_details` row (INNER JOIN).
- [ ] `GET /tasks/:id` returns 404 for another user's task.
- [ ] `PUT /tasks/:id` updates fields, upserts `task_details` when `details` is sent.
- [ ] `DELETE /tasks/:id` also removes the corresponding `task_details` row (delete details first, then the task).
- [ ] All queries use prepared statements (`?`).
- [ ] No `Bearer ` prefix is used; token is read directly from `Authorization` header (same as users routes).

### JOIN-specific
- [ ] Manually inspect the SQL in `models/tasks.js`: queries must use `INNER JOIN` for `/tasks/with-details` and `LEFT JOIN` everywhere else.
- [ ] Column aliases follow the `tD.priority AS t_priority` style.
- [ ] `mapRow` produces `{ ..., details: { priority, location, notes } | null }` and the controller returns this shape — never the flat row.

---

## Submission Requirements

1. A pull request / archive containing the **same `express-app`** project with the new files added (`models/tasks.js`, `controllers/tasks.js`, `routes/tasks.js`, `middlewares/schemas/tasks.schema.js`) and the updated `migrate.js` + `routes/index.js`.
2. A short `README` section (append to existing `README.md`) describing the new `/tasks` endpoints and the JOIN strategy.
3. A Postman / Insomnia collection (or `curl` examples) covering all task endpoints.
4. `.env.example` unchanged.

---

## Evaluation Criteria

- **Architectural compliance** (25%) — follows `express-app` conventions (ESM, Joi, crypto-js AES, md5, http-errors, lodash, mysql2/promise, models/controllers/routes/middlewares layout).
- **Correct JOIN usage** (25%) — INNER JOIN vs LEFT JOIN used in the right endpoints, table & column aliasing, mapping to nested `details`.
- **Functionality** (20%) — all endpoints behave as specified, business rules enforced.
- **Validation** (10%) — Joi schemas cover body / query / params.
- **Security & isolation** (10%) — every task query is scoped by `req.userId`, prepared statements everywhere.
- **Code quality** (10%) — clean, consistent with the existing codebase, no dead code.

---

**Good luck! Keep the codebase style consistent with `express-app` — that is half of the grade.** 🚀
