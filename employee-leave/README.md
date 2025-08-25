# Employee Leave Management API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A NestJS-based REST API for managing employee leave requests with authentication, validation, and leave limit enforcement.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-leave
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database connection and JWT secret:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/employee_leave"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   ```

## Database Setup

### Prisma Migration

1. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

2. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

3. **Reset database (if needed)**
   ```bash
   npx prisma migrate reset
   ```

### Database Seeder

1. **Run the seeder to populate initial data**
   ```bash
   npx prisma db seed
   ```

   This will create:
   - Sample admin accounts
   - Sample employee accounts
   - Sample leave requests

2. **View database in Prisma Studio**
   ```bash
   npx prisma studio
   ```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /auth/login` - Admin login
- `POST /auth/register` - Register new admin

### Admin Management
- `GET /admin` - Get all admins
- `POST /admin` - Create new admin
- `GET /admin/:id` - Get admin by ID
- `PUT /admin/:id` - Update admin
- `DELETE /admin/:id` - Delete admin

### Employee Management
- `GET /employee` - Get all employees
- `POST /employee` - Create new employee
- `GET /employee/:id` - Get employee by ID
- `PUT /employee/:id` - Update employee
- `DELETE /employee/:id` - Delete employee

### Leave Management
- `GET /leave` - Get all leaves
- `POST /leave` - Create leave request
- `GET /leave/:id` - Get leave by ID
- `PUT /leave/:id` - Update leave request
- `DELETE /leave/:id` - Delete leave request


## Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts               # Application entry point
├── modules/
│   ├── auth/             # Authentication module
│   ├── admin/            # Admin management module
│   ├── employee/         # Employee management module
│   └── leave/            # Leave management module
└── libs/
    └── prisma/           # Prisma database module
```

## Leave Validation Rules

- **Daily limit**: Maximum 1 day per month
- **Annual limit**: Maximum 12 days per year
- **Date validation**: End date must be after start date
- **No overlapping**: Cannot have overlapping leave periods

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `PORT` | Application port | 3001 |
