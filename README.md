# RME Learning Management System

A comprehensive enterprise-grade Learning Management System built for employee training management, from plan assignment to post-training behavior measurement.

## 🚀 Features

### Core Functionality
- **Bulk Import**: CSV/Excel import of training plans, courses, and employee mappings
- **Self-Registration**: Employee self-enrollment with seat control
- **Attendance Tracking**: Real-time tracking with 70% completion rule
- **Certificate Generation**: Automated PDF certificate creation and storage
- **Notification Engine**: Email, in-app, and calendar invite automation
- **Manager Dashboards**: Comprehensive reporting and 3-month post-training surveys
- **Data Export**: Excel exports and real-time KPIs

### User Roles
- **Employee (Learner)**: View plans, self-enroll, track progress, download certificates
- **Manager**: Team dashboards, behavior-change surveys, completion reports
- **Trainer**: Round management, bulk communications, attendance marking
- **Administrator**: Full system management, imports, reporting

### Core Modules
- Data Import Engine
- Notification System
- Enrollment Management
- Attendance Tracker
- Certificate Generator
- Survey Engine
- Reporting & Analytics

## 🏗️ Architecture

```
lms/
├── backend/           # Node.js/Express API with TypeScript
├── frontend/          # React application with TypeScript
├── shared/            # Shared types and utilities
├── database/          # Database schema and migrations
└── docs/              # Documentation
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based (SSO ready)
- **PDF Generation**: PDFKit
- **Email**: Nodemailer
- **File Upload**: Multer

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Installation

1. Clone and install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Set up the database:
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

4. Start development servers:
```bash
npm run dev
```

- Backend API: http://localhost:3001
- Frontend App: http://localhost:3000

## 📊 Data Model

The system follows a hierarchical structure:
- **Plans** contain multiple **Courses**
- **Courses** have multiple **Rounds** (scheduled deliveries)
- **Employees** are assigned **Plans** and enroll in **Rounds**
- **Attendance** and **Certificates** track completion

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Data validation and sanitization
- SQL injection protection via Prisma ORM

## 📈 Reporting

- Real-time dashboards
- Excel export functionality
- Custom report builder
- KPI widgets and analytics

## 🔮 Future Enhancements (Phase 2)

- Mobile app/PWA
- Training needs assessment
- Learning paths
- SCORM/xAPI content hosting
- Gamification
- AI-powered recommendations
- Budget tracking

## 📝 License

Internal enterprise software - All rights reserved.

## 🤝 Contributing

This is an internal project. Please follow the established development workflows and coding standards. 