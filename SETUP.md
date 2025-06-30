# RME Learning Management System - Setup Guide

This guide will walk you through setting up the RME LMS on your local development environment.

## 🏗️ Architecture Overview

The LMS consists of three main components:
- **Backend**: Node.js/Express API with PostgreSQL database
- **Frontend**: React application with TypeScript and Tailwind CSS
- **Shared**: Common types and utilities shared between frontend and backend

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14.0 or higher)
- **Git**

## 🚀 Quick Start

### 1. Database Setup

First, you need to set up PostgreSQL and create a database:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE rme_lms;
CREATE USER lms_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE rme_lms TO lms_user;
```

### 2. Environment Configuration

The environment files have been created with default values. Update them as needed:

**Backend Environment** (`backend/.env`):
- Update `DATABASE_URL` with your PostgreSQL connection string
- Configure email settings if you plan to use email notifications
- Change JWT secrets for production

**Frontend Environment** (`frontend/.env`):
- Usually no changes needed for local development

### 3. Install Dependencies

Install dependencies for all packages:

```bash
# Install shared package dependencies
cd shared
npm install
npm run build
cd ..

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install root dependencies
npm install
```

### 4. Database Migration and Seeding

Set up the database schema and seed with sample data:

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run seed
```

### 5. Start the Development Servers

You can start both servers simultaneously:

```bash
# From the root directory
npm run dev
```

Or start them separately:

```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Frontend App
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio** (Database GUI): `cd backend && npx prisma studio`

## 🔑 Login Credentials

After seeding, you can use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@company.com | admin123 |
| Manager | manager1@company.com | password123 |
| Trainer | trainer1@company.com | password123 |
| Employee | employee1@company.com | password123 |

## 📊 What's Included

The seeded database includes:

- **Users**: 1 admin, 3 managers, 3 trainers, 20 employees
- **Training Plans**: Leadership Development, Technical Skills, MEP
- **Courses**: 6 courses across different plans
- **Training Rounds**: Scheduled training sessions
- **Providers**: Internal and external training providers
- **Sample Enrollments**: Pre-enrolled students in various rounds
- **Notifications**: Sample system notifications

## 🛠️ Development Commands

### Backend Commands
```bash
cd backend

# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Database operations
npx prisma migrate dev     # Create and apply new migration
npx prisma generate        # Generate Prisma client
npx prisma studio         # Open database GUI
npm run seed              # Seed database with sample data

# Linting
npm run lint
npm run lint:fix
```

### Frontend Commands
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
npm run lint:fix
```

### Shared Package Commands
```bash
cd shared

# Build shared types and utilities
npm run build

# Watch mode for development
npm run dev
```

## 🗂️ Project Structure

```
lms/
├── backend/                 # Express.js API
│   ├── prisma/             # Database schema and migrations
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route handlers
│   │   └── utils/          # Utility functions
│   └── uploads/            # File upload directory
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React contexts (auth, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets
├── shared/                 # Shared types and utilities
│   └── src/
│       ├── types/          # TypeScript type definitions
│       ├── validation/     # Zod validation schemas
│       └── utils/          # Shared utility functions
└── docs/                   # Documentation
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in backend/.env
   - Verify database and user exist

2. **Port Already in Use**
   - Check if ports 3000 or 3001 are already in use
   - Change ports in environment files if needed

3. **Dependencies Issues**
   - Delete node_modules and package-lock.json
   - Run `npm install` again
   - Ensure Node.js version is 18+

4. **SSL Certificate Issues**
   - This was resolved in setup with `npm config set strict-ssl false`
   - For production, use proper SSL certificates

### Logs and Debugging

- Backend logs are in `backend/logs/`
- Frontend errors appear in browser console
- Use `npx prisma studio` to inspect database
- Check network tab for API calls

## 🚀 Next Steps

Once the basic setup is working:

1. **Explore the API** - Check out the authentication and basic CRUD endpoints
2. **Customize the UI** - Modify the Tailwind CSS themes and components
3. **Add Features** - Implement additional LMS functionality as needed
4. **Configure Email** - Set up SMTP for notifications
5. **Deploy** - Follow deployment guides for your preferred platform

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the console logs for error details
3. Ensure all prerequisites are met
4. Verify environment configuration

---

**Happy Learning! 🎓** 