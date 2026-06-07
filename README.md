# Express Auth Starter

![tsdown](https://img.shields.io/badge/tsdown-0.21-c39f61?logo=tsdown)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![Postgres](https://img.shields.io/badge/Postgres-17-blue?logo=postgresql)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.45-orange?logo=drizzle)

A production-ready **Express.js** REST API with **PostgreSQL**, JWT authentication, RBAC, and email notifications — built for rapid SaaS development.

---

## Core features

- Express 5 REST API with ESM
- JWT authentication with refresh token rotation
- Role-based access control (RBAC) with granular permissions
- PostgreSQL with Drizzle ORM migrations and seeding
- Zod validation for all request payloads
- OpenAPI 3.1 documentation (Scalar UI + JSON spec)
- Email templating with Handlebars and AWS SES
- Secure password hashing with bcrypt
- Request logging and centralized error handling

---

## Project structure

```
express-auth/
├── docs/                          # OpenAPI documentation layer
│   ├── helpers/                   # Shared doc helpers (error responses, security)
│   ├── routes/                    # Route registrars for OpenAPI paths
│   ├── schemas/
│   │   ├── common.ts              # api* primitive schemas
│   │   ├── entities.ts            # api* response entity schemas
│   │   ├── responses.ts           # api* success/error wrappers
│   │   └── requests/              # api* request/query schemas per module
│   ├── openapi.ts                 # Generates the OpenAPI document
│   ├── registry.ts                # OpenAPIRegistry singleton
│   └── scalar.ts                  # Scalar UI + /openapi.json route
├── src/
│   ├── bootstrap/
│   │   └── zod-extend.ts          # Extends Zod with .openapi()
│   ├── db/                        # Drizzle schema, migrations, seeds
│   ├── middlewares/               # authorizer, error handler
│   ├── modules/                   # Feature modules (controller, router, service, …)
│   │   ├── common/                # Shared validation and helpers
│   │   ├── user/                  # Auth and user management
│   │   ├── role/
│   │   ├── permission/
│   │   ├── role-user/
│   │   ├── role-permission/
│   │   ├── auth-token/
│   │   └── …
│   ├── routes/index.ts            # Mounts all routers
│   ├── server.ts
│   └── utils/env.ts
├── AUTH.md                        # Auth endpoints, tokens, test plan
└── AGENTS.md                      # Agent/coding conventions
```

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/shahnewaz171/express-rest-starter.git
cd express-rest-starter
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables include `DATABASE_URL`, `JWT_SECRET`, `JWT_ISSUER`, `API_BASE_URL`, `CLIENT_APP_URL`, `FROM_EMAIL`, and AWS SES credentials. See `.env.example` for the full list.

### 4. Run database migrations

```bash
pnpm run db:migrate
```

### 5. Seed initial data

```bash
pnpm run db:seed
```

### 6. Start the development server

```bash
pnpm run dev
```

---

## Access

- **Express API** → `http://localhost:8000`
- **PostgreSQL** → `localhost:5432`

---

## 🛠️ Commands

- Run development server:

  ```bash
  pnpm run dev
  ```

- Build for production:

  ```bash
  pnpm run build
  ```

- Run production build:

  ```bash
  pnpm run start
  ```

- Type check:

  ```bash
  pnpm run typecheck
  ```

- Generate migration files:

  ```bash
  pnpm run db:generate
  ```

- Open Drizzle Studio:

  ```bash
  pnpm run db:studio
  ```

Docker Compose scripts (`compose:dev`, `compose:prod`, etc.) are also available — see `package.json`.

---

Created by **Muhammad Shahnewaz**. If you find this useful, star the repo or reach out.
