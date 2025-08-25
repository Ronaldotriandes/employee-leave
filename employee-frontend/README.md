# Employee Management System Frontend

A Next.js frontend application for managing employees and their leave requests.

## Features

### Admin Management
- **Authentication**: Secure login system for administrators
- **Profile Management**: Admins can update their personal information and change passwords
- **Admin CRUD**: Create, read, update, and delete admin accounts
- **Data Fields**: First Name, Last Name, Email, Birth Date, Gender, Password

### Employee Management
- **Employee CRUD**: Full employee management capabilities
- **Data Fields**: First Name, Last Name, Email, Phone Number, Address, Gender
- **Employee-Leave Relationship**: Each employee can have multiple leave requests

### Leave Management
- **Leave CRUD**: Create, read, update, and delete leave requests
- **Business Rules Implementation**:
  - Maximum 12 days of leave per employee per year
  - Maximum 1 day of leave per employee per month
  - Each leave request is limited to 1 day
- **Data Fields**: Leave Reason, Start Date, End Date, Employee Assignment

### Reporting
- **Employee Reports**: View all employees with their leave data
- **Leave Analytics**: Track leave usage by year and month
- **Export Functionality**: Export reports to CSV format
- **Leave Summary**: See remaining leave days and usage patterns

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **TypeScript**: Full type safety

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard pages (protected)
│   │   ├── admins/       # Admin management
│   │   ├── employees/    # Employee management
│   │   ├── leaves/       # Leave management
│   │   ├── profile/      # Admin profile
│   │   └── reports/      # Employee reports
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
└── lib/
    ├── api.ts            # Axios configuration
    ├── auth.ts           # Authentication hooks
    ├── types.ts          # TypeScript interfaces
    └── utils.ts          # Utility functions
```

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Backend URL**:
   Update the API base URL in `src/lib/api.ts` to match your NestJS backend.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Getting Started
1. Start the NestJS backend server
2. Create an admin account through the backend
3. Login with admin credentials
4. Begin managing employees and leave requests

### Navigation
- **Dashboard**: Overview statistics and quick actions
- **Profile**: Manage admin profile and change password
- **Admin Management**: CRUD operations for administrators
- **Employee Management**: CRUD operations for employees
- **Leave Management**: CRUD operations for leave requests with business rule validation
- **Reports**: View detailed employee leave reports with export functionality

### Business Rules
The system enforces the following leave policies:
- Each employee can take a maximum of 12 days of leave per calendar year
- Each employee can only take 1 day of leave per month
- Each individual leave request is limited to 1 day
- All rules are validated both on the frontend and should be enforced on the backend

## API Endpoints Expected

The frontend expects the following REST API endpoints from the NestJS backend:

- `POST /auth/login` - Admin authentication
- `GET|POST|PATCH|DELETE /admin` - Admin management
- `GET|POST|PATCH|DELETE /employee` - Employee management  
- `GET|POST|PATCH|DELETE /leave` - Leave management

## Features Implemented

✅ Admin authentication (login/logout)
✅ Admin profile management
✅ Admin CRUD operations
✅ Employee CRUD operations
✅ Leave CRUD with business rules validation
✅ Employee reports with leave data
✅ Responsive design
✅ Form validation
✅ Error handling
✅ CSV export functionality
