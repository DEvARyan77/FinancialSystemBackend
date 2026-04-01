# Finance Data Processing and Access Control Backend

A production-ready backend for a finance dashboard with role-based access control, financial record management, dashboard summaries, and caching. Built with Node.js, Express, PostgreSQL, Redis, and Nginx, and containerized with Docker.

## Features

- **User Authentication** – JWT-based registration and login with encrypted passwords (bcrypt).
- **Role-Based Access Control (RBAC)** – 
  - *Viewer*: Read-only access.
  - *Analyst*: Read, create, and update own records.
  - *Admin*: Full control, including soft-deleting records and managing users.
- **Financial Record CRUD** – Create, read, update, and soft delete records with advanced filtering (date, type, category) and pagination.
- **Dashboard Summaries** – Total income/expense, net balance, category totals, recent activity, and monthly/weekly trends.
- **Caching Integration** – Redis caches dashboard summaries for 5 minutes. Automatically invalidates on record creation, update, or deletion.
- **Reverse Proxy** – Nginx serves as a reverse proxy in front of the Node app (in Docker setup).
- **Containerization** – Docker and Docker Compose configuration to run the whole stack (PostgreSQL, Redis, Node app, Nginx) seamlessly.

## Tech Stack

| Component     | Technology                            |
|---------------|---------------------------------------|
| Runtime       | Node.js + Express                     |
| Database      | PostgreSQL (using pg)                 |
| Cache         | Redis (using ioredis)                 |
| Auth          | JWT + bcrypt                          |
| Validation    | Joi                                   |
| Proxy         | Nginx                                 |
| Container     | Docker & Docker Compose               |
| Testing       | Jest + Supertest                      |

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL (or run via Docker)
- Redis (or run via Docker)
- Docker & Docker Compose (optional, for containerized setup)

### Local Installation (Without Docker)

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/finance-backend.git](https://github.com/yourusername/finance-backend.git)
   cd finance-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
   TEST_DATABASE_URL=postgresql://user:password@localhost:5432/finance_test_db
   REDIS_URL=redis://localhost:6379
   ```

4. Start your local PostgreSQL and Redis servers.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Installation

To run the entire stack (App, DB, Redis, Nginx) using Docker:

```bash
docker-compose up --build
```

The API will be accessible via Nginx at `http://localhost`.

---

## API Documentation

Interactive API documentation is available via Swagger UI. 
Start the server and navigate to: **`http://localhost:5000/api-docs`**

A Postman collection is also included in the repository (`finance-backend.postman_collection.json`). Import it into Postman to easily test all endpoints.

### Quick Reference

*Note: All endpoints except `/auth/register` and `/auth/login` require an `Authorization: Bearer <token>` header.*

#### Authentication
- `POST /api/v1/auth/register` - Register a new user (roles: `viewer`, `analyst`, `admin`).
- `POST /api/v1/auth/login` - Authenticate and receive a JWT.

#### Financial Records
- `POST /api/v1/records` - Create a record (Analyst/Admin).
- `GET /api/v1/records` - List records. Supports queries: `?type=`, `?category=`, `?from=`, `?to=`, `?limit=`, `?offset=`, `?all=true` (Admin only).
- `GET /api/v1/records/:id` - Get a single record.
- `PUT /api/v1/records/:id` - Update a record (Analyst/Admin).
- `DELETE /api/v1/records/:id` - Soft delete a record (Admin only).

#### Dashboard (Cached via Redis)
- `GET /api/v1/dashboard/summary` - Total income, expenses, and net balance.
- `GET /api/v1/dashboard/category-totals` - Amounts grouped by category and type.
- `GET /api/v1/dashboard/recent?limit=5` - Most recent transactions.
- `GET /api/v1/dashboard/trends?period=month` - Income/expense aggregated over time.

#### User Management (Admin Only)
- `GET /api/v1/users` - List all users.
- `PUT /api/v1/users/:id` - Update user details/role.
- `DELETE /api/v1/users/:id` - Permanently delete a user.

#### System
- `GET /health` - API Health check.

---

## Database Schema

**`users` Table**
| Column     | Type      | Description |
|------------|-----------|-------------|
| id         | SERIAL    | Primary key |
| name       | TEXT      | User's name |
| email      | TEXT      | Unique email |
| password   | TEXT      | Hashed password |
| role       | TEXT      | `viewer`, `analyst`, `admin` |
| status     | TEXT      | `active`, `inactive` |
| created_at | TIMESTAMP | Creation time |

**`financial_records` Table**
| Column      | Type      | Description |
|-------------|-----------|-------------|
| id          | SERIAL    | Primary key |
| amount      | REAL      | Positive amount |
| type        | TEXT      | `income`, `expense` |
| category    | TEXT      | Category name |
| date        | DATE      | Transaction date |
| description | TEXT      | Optional note |
| user_id     | INTEGER   | Foreign key to `users.id` |
| created_at  | TIMESTAMP | Creation time |
| deleted_at  | TIMESTAMP | Soft delete timestamp (nullable) |

---

## Testing

The project uses `Jest` and `Supertest` for integration testing.

```bash
# Ensure TEST_DATABASE_URL is set in your .env
npm test
```
*Note: Tests wipe the database specified in `TEST_DATABASE_URL` before running. Do not use your production database credentials for testing.*

## Caching Strategy

- Dashboard endpoints are cached per user in Redis for 5 minutes.
- **Cache Invalidation:** Creating, updating, or deleting a financial record automatically clears the specific user's cached dashboard data.
- **Manual Clear:** `redis-cli DEL dashboard-summary:<user_id>`

## Deployment

This application is ready to be deployed to platforms like Render, Railway, or Heroku.

**Render Deployment Steps:**
1. Create a PostgreSQL database and Redis instance on Render.
2. Create a new Web Service connected to your GitHub repo.
3. Set environment variables (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`).
4. Build command: `npm install`
5. Start command: `npm start`
*(Note: Render provides its own reverse proxy, so the Nginx container is not strictly required for this platform).*

## License
MIT

## Postman Collection

A Postman collection is available in the repository root: `Finance Backend.postman_collection.json`.  
Import it into Postman, set the environment variable `baseUrl` (e.g., `http://localhost:5000/api/v1`), and use the requests to test the API.