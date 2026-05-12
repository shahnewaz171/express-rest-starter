# Express Auth Boilerplate

A modern, enterprise-grade REST API boilerplate built with Express 5, TypeScript, PostgreSQL, and Drizzle ORM. Designed for rapid development of secure, scalable SaaS applications with JWT authentication, role-based access control, and email notification support.

## Core Features

- JWT-based authentication with refresh token rotation
- Role-based access control (RBAC) with granular permissions
- PostgreSQL database with Drizzle ORM migrations & seeding
- Zod validation for all request payloads
- Swagger/OpenAPI documentation
- Email templating with Handlebars
- Secure password hashing with bcrypt
- Request logging, error handling, and rate limiting

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file and configure
cp .env.example .env

# Run database migrations
pnpm run db:migrate

# Seed initial data (roles, permissions, templates, admin user)
pnpm run db:seed

# Start development server
pnpm run dev
```

### Useful Commands

```bash
pnpm run build          # Lint and compile to dist/
pnpm run start          # Run production build
pnpm run typecheck      # TypeScript type checking
pnpm run db:generate    # Generate new migration files
pnpm run db:studio      # Open Drizzle Studio
```

## Project Structure

```
src/
├── db/                 # Database connection, migrations, and seeds
├── lib/                # Shared utilities (email, logger, swagger)
├── middlewares/        # Express middlewares (auth, error handler)
├── modules/            # Feature modules (controllers, services, routes, schemas)
│   ├── auth-token/
│   ├── auth-template/
│   ├── common/
│   ├── doc/
│   ├── notification/
│   ├── permission/
│   ├── role/
│   ├── role-permission/
│   ├── role-user/
│   ├── user/
│   └── verification-token/
├── routes/             # Route aggregation and test utilities
├── utils/              # Environment config and helpers
└── server.ts           # Application entry point
```

---

Made by Muhammad Shahnewaz
