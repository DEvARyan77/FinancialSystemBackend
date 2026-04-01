# Finance Data Processing and Access Control Backend

A robust backend system for a finance dashboard with role-based access control (viewer, analyst, admin). Built with Node.js, Express, SQLite, JWT authentication, and Joi validation. Provides CRUD operations for financial entries, dashboard summary APIs, user management, and full permission enforcement.

## Features
- User authentication: Register and login with JWT tokens.
- Role-based access control: Viewer (read-only), Analyst (read + create/update own records), Admin (full control).
- Financial record CRUD: Create, read, update, soft delete records with filtering (by date, type, category) and pagination.
- Dashboard summaries: Total income/expense, net balance, category-wise totals, recent activity, and monthly/weekly trends.
- Admin user management: List, update, delete users.
- Soft delete: Records are not permanently deleted; 'deleted_at' column marks deletion, preserving data for audits.
- Admin all-records view: Admin can view all records across users via '?all=true' query parameter.
- Pagination metadata: Returns total count and pages alongside data.
- Global error handler: Consistent error responses for validation, duplicate entries, and server errors.
- Input validation: Using Joi to validate request bodies.

## Tech Stack
- Node.js: Runtime environment
- Express: Web framework
- SQLite (better-sqlite3): Lightweight embedded database
- JSON Web Tokens (JWT): Authentication
- bcryptjs: Password hashing
- Joi: Request validation
- dotenv: Environment variables

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
1. Clone the repository:
   git clone https://github.com/yourusername/finance-backend.git
   cd finance-backend

2. Install dependencies:
   npm install

3. Create a .env file in the root directory:
   PORT=5000
   JWT_SECRET=your_super_secret_key_change_this

4. Start the server:
   npm run dev

The server will start on http://localhost:5000 and automatically create a finance.db SQLite database file in the project root. The deleted_at column for soft delete will be added automatically if it doesn't exist.

---

## API Documentation

All endpoints (except /api/auth/register and /api/auth/login) require a JWT token in the Authorization header:
Authorization: Bearer <your_token>

### Authentication

POST /api/auth/register
Registers a new user.
Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "viewer" 
}

POST /api/auth/login
Logs in an existing user.
Request Body:
{
  "email": "john@example.com",
  "password": "123456"
}

### Financial Records

POST /api/records
Create a new financial record.
Roles allowed: analyst, admin
Request Body:
{
  "amount": 1000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "description": "Monthly salary"
}

GET /api/records
List records for the authenticated user (or all records for admin with ?all=true). Supports filtering and pagination.
Roles allowed: all
Query Parameters: type, category, from, to, limit, offset, all

GET /api/records/:id
Get a single record by ID.
Roles allowed: all (users can only see their own records; admin can see any)

PUT /api/records/:id
Update a record. At least one field is required.
Roles allowed: analyst, admin (analyst can only update their own records)

DELETE /api/records/:id
Soft delete a record (marks deleted_at timestamp). The record will no longer appear in queries.
Roles allowed: admin only

### Dashboard

GET /api/dashboard/summary
Returns total income, total expenses, and net balance for the authenticated user.
Roles allowed: all

GET /api/dashboard/category-totals
Returns amounts grouped by category and type.
Roles allowed: all

GET /api/dashboard/recent?limit=5
Returns the most recent records. Default limit is 5.
Roles allowed: all

GET /api/dashboard/trends?period=month
Returns aggregated income/expense over time. period can be month or week.
Roles allowed: all

### User Management (Admin Only)

GET /api/users
List all users (without passwords).
Roles allowed: admin

PUT /api/users/:id
Update a user. At least one field required.
Roles allowed: admin

DELETE /api/users/:id
Permanently delete a user (hard delete).
Roles allowed: admin

---

## Database Schema

### users
id (INTEGER) - Primary key
name (TEXT) - User's name
email (TEXT) - Unique email
password (TEXT) - Hashed password
role (TEXT) - viewer, analyst, admin
status (TEXT) - active or inactive
created_at (DATETIME) - Timestamp

### financial_records
id (INTEGER) - Primary key
amount (REAL) - Positive amount
type (TEXT) - income or expense
category (TEXT) - Category name
date (DATE) - Transaction date
description (TEXT) - Optional note
user_id (INTEGER) - Foreign key to users.id
created_at (DATETIME) - Creation timestamp
deleted_at (DATETIME) - Nullable, soft delete timestamp

---

## Assumptions & Trade-offs
- Authentication: JWT token expiry set to 7 days; no refresh tokens.
- Role permissions: analyst can only update/delete their own records; admin can manage all records and users.
- Soft delete: Applied only to financial records (not users). Deleted records are excluded from queries but remain in the database.
- Admin all-records: Implemented via ?all=true query parameter.
- Pagination: Uses limit/offset. For large datasets, cursor-based pagination would be more efficient, but this suffices for the scope.
- Error handling: Global handler catches unhandled errors; validation errors return 400 with details.
- Database: SQLite used for simplicity; in production, PostgreSQL would be better for concurrent access.

---

## Testing
You can test the endpoints using Postman. A Postman collection is available in the repository root: Finance Backend.postman_collection.json.
To run unit tests: npm test

## Deployment
To deploy this backend to a service like Render or Heroku:
- Ensure you have a Procfile (if needed).
- Set environment variables (JWT_SECRET, PORT).
- Use a production database (e.g., PostgreSQL).

## License
MIT

## Author
Dev Aryan
This project was developed as part of a backend developer internship assignment to demonstrate API design, data modeling, business logic, and access control.