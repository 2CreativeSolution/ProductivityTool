# RedwoodJS Framework Notes (Outdated??)

This file preserves **generic RedwoodJS framework content** that originally lived in `README.md`.
It is intentionally separated so the root README can stay **project-specific and review-safe**.

---

> - Redwood requires [Node.js](https:/# 🚀 2Creative Productivity Tool

A comprehensive enterprise productivity management system built with RedwoodJS, designed to streamline employee workflows, resource management, and project tracking for modern organizations.

[![RedwoodJS](https://img.shields.io/badge/RedwoodJS-8.9.0-red)](https://redwoodjs.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-25.x-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)](https://postgresql.org)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [External Libraries](#external-libraries)
- [Authentication](#authentication)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Support](#support)

## 🎯 Overview

The 2Creative Productivity Tool is a full-stack web application designed to manage various aspects of organizational productivity including:

- **Employee Management**: User profiles, roles, and department assignments
- **Asset Tracking**: Company assets, assignments, and maintenance tracking
- **Project Management**: Project allocation, budget tracking, and daily updates
- **Office Supplies**: Inventory management and request system
- **Time & Attendance**: Employee attendance tracking and vacation management
- **Authentication**: Secure login with role-based access control

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (netlify)                                      │
│  ├── Pages (Dashboard, Assets, Projects, etc.)                 │
│  ├── Components (Header, Modals, Forms)                        │
│  ├── Layouts (MainLayout, AuthLayout)                          │
│  └── Authentication (DbAuth)                                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ GraphQL API
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  RedwoodJS API (Port 8911)                                     │
│  ├── GraphQL Services                                          │
│  ├── Authentication Functions                                  │
│  ├── Business Logic                                            │
│  └── Data Validation                                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Prisma ORM
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL Database                                            │
│  ├── User Management (Users, Roles, Departments)               │
│  ├── Asset Management (Assets, Requests)                       │
│  ├── Project Management (Projects, Allocations, Budgets)       │
│  ├── Office Supplies (Supplies, Requests)                      │
│  └── Attendance & Vacation Tracking                            │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
Frontend React App
        │
        ├── User Authentication ──────► DB Auth
        │
        ├── GraphQL Queries/Mutations ──────► RedwoodJS API
        │                                           │
        │                                           ├── Services Layer
        │                                           │
        │                                           ├── Prisma ORM
        │                                           │
        │                                           └── PostgreSQL DB
        │
        └── Static Assets ──────► Public Directory
```

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Login**: DbAuth authentication
- **Role-Based Access**: Admin, Manager, Team Lead, User roles
- **Profile Management**: User can update personal information

### 👥 Employee Management
- **User Profiles**: Complete employee information management
- **Department Assignment**: Engineering, Design, Marketing, Sales, HR, Finance
- **Designation Tracking**: Job titles and role hierarchies
- **Contact Information**: Email, phone, and address management

### 💼 Asset Management
- **Asset Tracking**: Complete inventory of company assets
- **Assignment System**: Track who has what equipment
- **Request Management**: Employees can request new assets
- **Maintenance Records**: Track asset condition and maintenance
- **Department-wise Allocation**: Assets organized by department

### 📊 Project Management
- **Project Creation**: Set up projects with budgets and timelines
- **Daily Allocations**: Track how employees spend their time
- **Budget Tracking**: Monitor project expenses and budget utilization
- **Progress Reporting**: Real-time project status updates
- **Team Allocation**: Assign team members to projects

### 📦 Office Supplies Management
- **Inventory System**: Track office supplies and stock levels
- **Request System**: Employees can request supplies
- **Approval Workflow**: Manager approval for supply requests
- **Stock Alerts**: Low stock notifications
- **Usage Tracking**: Monitor supply consumption patterns

### 📅 Time & Attendance
- **Attendance Tracking**: Daily check-in/check-out system
- **Vacation Requests**: Submit and approve vacation requests
- **Leave Balance**: Track available vacation days
- **Calendar Integration**: Visual calendar for scheduling

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Routing**: RedwoodJS Router
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React Hooks + Context
- **Form Handling**: RedwoodJS Forms
- **Icons**: React Icons + RemixIcon
- **Animations**: Framer Motion, GSAP
- **Calendar**: React Big Calendar
- **Date Handling**: Moment.js

### Backend
- **Framework**: RedwoodJS 8.9.0
- **API**: GraphQL with Apollo Server
- **Database ORM**: Prisma
- **Authentication**: DbAuth
- **Email**: Nodemailer
- **JWT**: JSON Web Tokens
- **File Processing**: Papa Parse (CSV)
- **PDF Generation**: jsPDF + jsPDF AutoTable

### Database
- **Primary Database**: PostgreSQL
- **Development Database**: SQLite (optional)
- **Migrations**: Prisma Migrate
- **Seeding**: Custom seed scripts

### Development & Deployment
- **Package Manager**: Yarn 4.6.0
- **Build Tool**: Vite + ESBuild
- **Testing**: Jest
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Deployment**: Netlify (recommended)
- **CI/CD**: GitHub Actions compatible

## 📋 Prerequisites

Before installing this project, ensure you have the following installed:

- **Node.js**: Version 25.x (as specified in engines). Redwood quick start lists 20.x; this project standard is 25.x. Recommended to use NVM on macOS.
- **Yarn**: Latest version (4.6.0+)
- **PostgreSQL**: Version 12+ (for production)
- **Git**: For version control


## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/njaswal4/productivity-tool.git
cd productivity-tool
nvm use # -- sets right node version
```

### 2. Install Dependencies
```bash
# Install all dependencies for both web and api workspaces
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/productivity_db"


# Email Configuration (Optional)
SMTP_HOST="your-smtp-server"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

### 2. Run Migrations
```bash
# Generate Prisma client and run migrations
yarn rw prisma migrate dev
```

### 3. Seed Database (Optional)
```bash
# Populate with sample data
yarn rw prisma db seed
```

### 4. Generate Prisma Client
```bash
# Generate the Prisma client
yarn rw prisma generate
```

## 💻 Development

### Start Development Server
```bash
# Start both web and api servers
yarn rw dev
```

This will start:
- **Web server**: http://localhost:8910
- **API server**: http://localhost:8911
- **GraphQL Playground**: http://localhost:8911/graphql

### Development Commands
```bash
# Run tests
yarn rw test

# Check code quality
yarn rw check

# Build for production
yarn rw build

# Database operations
yarn rw prisma studio          # Open Prisma Studio
yarn rw prisma migrate dev     # Create and apply new migration
yarn rw prisma db seed         # Run seed script
```

### Hot Reloading
The development server supports hot reloading for both frontend and backend changes.

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Build Settings**:
   - **Build Command**: `yarn rw deploy netlify`
   - **Publish Directory**: `web/dist`
   - **Functions Directory**: `api/dist/functions`

2. **Environment Variables**:
   Set all environment variables in Netlify dashboard

3. **Deploy**:
```bash
# Deploy to Netlify
yarn rw deploy netlify
```

### Other Deployment Options
- **Vercel**: Full-stack deployment
- **Railway**: PostgreSQL + hosting
- **Render**: Database + web service
- **AWS**: Using Serverless Framework or SST

## 📁 Project Structure

```
Productivity_Tool/
├── api/                          # Backend API
│   ├── db/
│   │   ├── migrations/           # Database migrations
│   │   └── schema.prisma         # Database schema
│   └── src/
│       ├── functions/            # Serverless functions
│       ├── graphql/              # GraphQL schemas
│       ├── lib/                  # Utility functions
│       └── services/             # Business logic
├── web/                          # Frontend React app
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── layouts/              # Page layouts
│   │   ├── pages/                # Route components
│   │   └── lib/                  # Client utilities
├── scripts/                      # Database seeds & utilities
├── docs/                         # Documentation
├── package.json                  # Root dependencies
├── redwood.toml                  # RedwoodJS configuration
├── netlify.toml                  # Netlify deployment config
└── README.md                     # This file
```

## 📚 External Libraries

### Core Dependencies
```json
{
  "@redwoodjs/core": "8.9.0",           // Full-stack framework
  "react": "18.3.1",                     // UI library
  "prisma": "latest",                     // Database ORM
  "graphql": "latest",                    // API query language
  "tailwindcss": "latest"                 // CSS framework
}
```

### UI & Animation Libraries
```json
{
  "framer-motion": "^12.6.0",           // Advanced animations
  "gsap": "^3.13.0",                    // High-performance animations
  "@heroicons/react": "^2.2.0",        // SVG icons
  "react-icons": "^5.5.0",             // Icon library
  "react-big-calendar": "^1.19.4",     // Calendar component
  "react-calendar": "^6.0.0"           // Date picker
}
```

### Utility Libraries
```json
{
  "moment": "^2.30.1",                  // Date manipulation
  "jsonwebtoken": "^9.0.2",            // JWT handling
  "papaparse": "^5.5.3",               // CSV processing
  "jspdf": "^3.0.1",                   // PDF generation
  "jspdf-autotable": "^5.0.2",         // PDF tables
  "nodemailer": "^7.0.4",              // Email sending
  "semver": "^7.7.2"                   // Version handling
}
```

### Mobile & Desktop
```json
{
  "@capacitor/core": "^7.4.0",         // Cross-platform runtime
  "@capacitor/cli": "^7.4.0",          // Capacitor CLI
  "@capacitor/ios": "^7.4.0"           // iOS platform
}
```

## 🔐 Authentication

### Supported Auth Providers
1. **DbAuth**: Self-hosted authentication

### User Roles
- **USER**: Basic employee access
- **TEAM_LEAD**: Team management permissions
- **MANAGER**: Department-level access
- **ADMIN**: Full system access

### Protected Routes
```javascript
// Example protected route
<PrivateSet unauthenticated="login">
  <Route path="/dashboard" page={DashboardPage} name="dashboard" />
  <Route path="/admin" page={AdminPage} name="admin" roles="ADMIN" />
</PrivateSet>
```

## 📖 API Documentation

### GraphQL Endpoints
- **Development**: http://localhost:8911/graphql
- **Production**: https://your-app.netlify.app/.redwood/functions/graphql

### Key Operations
```graphql
# User Management
query GetUsers { users { id name email role } }
mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id } }

# Asset Management
query GetAssets { assets { id name assignedTo department } }
mutation RequestAsset($input: CreateAssetRequestInput!) { createAssetRequest(input: $input) { id } }

# Project Management
query GetProjects { projects { id name budget allocatedHours } }
mutation UpdateProject($id: Int!, $input: UpdateProjectInput!) { updateProject(id: $id, input: $input) { id } }
```


### Code Standards
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Code formatting is automated
- **TypeScript**: Use TypeScript for better type safety
- **Testing**: Write tests for new features

### Pull Request Guidelines
- Provide clear description of changes
- Include relevant tests
- Update documentation if needed
- Ensure all CI checks pass

## Contributing

See `docs/CONTRIBUTING.md` for the current workflow and checklists.

## 📞 Support

### Getting Help
- **Documentation**: [RedwoodJS Docs](https://redwoodjs.com/docs)
- **Community**: [RedwoodJS Discord](https://discord.gg/redwoodjs)
- **Issues**: Create an issue in this repository

### Common Issues
1. **Database Connection**: Verify PostgreSQL is running and DATABASE_URL is correct
2. **Port Conflicts**: Ensure ports 8910 and 8911 are available
3. **Node Version**: Use exactly Node.js 25.x
4. **Yarn Version**: Use Yarn 4.6.0+

### Performance Tips
- Enable caching for GraphQL queries
- Use database indexes for frequently queried fields
- Optimize images in the public directory
- Enable compression in production
