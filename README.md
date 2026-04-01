# Finance Data Processing and Access Control Backend

This is a backend system for a finance dashboard that manages financial records and enforces role-based access control.

## Tech Stack
- Node.js
- Express
- SQLite (better-sqlite3)
- JWT for authentication
- Joi for validation

## Features
- User registration/login with JWT
- Role-based access control: viewer, analyst, admin
- CRUD operations on financial records
- Dashboard summary APIs (total income/expense, category totals, recent activity, trends)
- Filtering and pagination for records
- Admin user management

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with:
PORT=5000
JWT_SECRET=your_secret_key

4. Run the server: `npm run dev`

The database file `finance.db` will be created automatically on first run.

## API Documentation

### Authentication

#### POST `/api/auth/register`
- **Body**: `{ "name": "string", "email": "string", "password": "string", "role": "viewer|analyst|admin" }`
- **Response**: user object and JWT

#### POST `/api/auth/login`
- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: user object and JWT

### Financial Records (require auth token)

#### POST `/api/records`
- **Body**: `{ "amount": number, "type": "income|expense", "category": "string", "date": "YYYY-MM-DD", "description": "string" }`
- **Roles allowed**: analyst, admin

#### GET `/api/records`
- **Query params**: `type`, `category`, `from`, `to`, `limit`, `offset`
- **Roles allowed**: all

#### GET `/api/records/:id`
- **Roles allowed**: all

#### PUT `/api/records/:id`
- **Body**: any of the fields (at least one)
- **Roles allowed**: analyst, admin (and only for own record if not admin)

#### DELETE `/api/records/:id`
- **Roles allowed**: admin only

### Dashboard

#### GET `/api/dashboard/summary`
- **Response**: `{ totalIncome, totalExpenses, netBalance }`

#### GET `/api/dashboard/category-totals`
- **Response**: `[{ category, type, total }]`

#### GET `/api/dashboard/recent?limit=5`
- **Response**: list of most recent records

#### GET `/api/dashboard/trends?period=month`
- **Response**: `[{ period, income, expense }]`

### User Management (admin only)

#### GET `/api/users`
- **Response**: list of users (without passwords)

#### PUT `/api/users/:id`
- **Body**: `{ name, email, role, status, password }` (any fields)
- **Response**: updated user

#### DELETE `/api/users/:id`
- **Response**: 204 No Content

## Assumptions
- Roles: viewer (read-only), analyst (read + create/update own records), admin (full control).
- Authentication is JWT-based; tokens expire in 7 days.
- Password hashing with bcrypt.
- Records are owned by the user who created them; admin can see all records (not yet implemented in code, but you can extend).
- For simplicity, admin can view all records by modifying the queries.

## Trade-offs
- Used SQLite for simplicity; could be replaced with PostgreSQL.
- No frontend; only backend APIs.
- Some endpoints (e.g., admin seeing all records) not fully implemented but can be extended.

## License
MIT