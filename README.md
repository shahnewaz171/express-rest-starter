# Express Auth Starter

![tsdown](https://img.shields.io/badge/tsdown-0.21-c39f61?logo=tsdown)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![Postgres](https://img.shields.io/badge/Postgres-17-blue?logo=postgresql)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.45-orange?logo=drizzle)

A boilerplate setup for running an **Express.js** backend with **PostgreSQL** using Drizzle ORM.
This repository provides a production-ready REST API with JWT authentication, RBAC, and email notifications for rapid SaaS development.

---

## 🚀 Core Features

- Express 5 REST API with ESM
- JWT authentication with refresh token rotation
- Role-based access control (RBAC) with granular permissions
- PostgreSQL with Drizzle ORM migrations & seeding
- Zod validation for all request payloads
- Swagger/OpenAPI documentation
- Email templating with Handlebars & Nodemailer
- Secure password hashing with bcrypt
- Request logging and error handling

---

## 📂 Project Structure

```
express-rest-starter/
└───src/
   ├───server.ts
   ├───db/
   │   ├───index.ts
   │   ├───migrate.ts
   │   ├───schema.ts
   │   ├───seed.ts
   │   └───seeds/
   │       └───**.seed.ts
   ├───lib/
   │   └───index.ts
   ├───middlewares/
   │   ├───authorizer.ts
   │   └───error.ts
   ├───modules/
   │   ├───controllers.ts
   │   ├───helpers.ts
   │   ├───routers.ts
   │   ├───services.ts
   │   ├───**/
   │   │   ├───**.controller.ts
   │   │   ├───**.helper.ts
   │   │   ├───**.router.ts
   │   │   ├───**.schema.ts
   │   │   ├───**.service.ts
   │   │   └───**.type.ts
   ├───routes/
   │   └───index.ts
   └───utils/
      ├───env.ts
      └───error/
         └───index.ts
```

---

## ⚙️ Setup

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

Copy the `.env.example` file into `.env` and customize as per need:

```bash
cp .env.example .env
```

### 4. Run database migrations

```bash
pnpm run db:migrate
```

### 5. Seed initial data

```bash
pnpm run db:seed
```

### 6. Start development server

```bash
pnpm run dev
```

---

## 🌐 Access

- **Express API** → `http://localhost:8000`
- **PostgreSQL** → `localhost:5434`

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

---

👋 Created by **Muhammad Shahnewaz**. If you find this useful, ⭐ the repo or reach out!