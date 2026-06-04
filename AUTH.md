# Authentication & Authorization

Reference for the auth module: endpoints, token model, the notification/transaction
architecture, and a verification/test plan.

All routes below are mounted under the `/auth` prefix (`src/routes/index.ts` →
`router.use('/auth', userRouter)`). There is no global `/api` prefix; the router is
mounted at the app root in `src/server.ts`.

---

## 1. Endpoint reference

| Method | Path                              | Auth            | Purpose                                            |
| ------ | --------------------------------- | --------------- | -------------------------------------------------- |
| POST   | `/auth/register`                  | Public          | Create account, issue email-verification OTP       |
| POST   | `/auth/verify-user-email`         | Public          | Verify account with OTP                            |
| POST   | `/auth/resend-verification-email` | Public          | Re-issue verification OTP                          |
| POST   | `/auth/login`                     | Public          | Authenticate, issue access + refresh tokens        |
| POST   | `/auth/refresh-token`             | Public          | Exchange refresh token for new tokens              |
| GET    | `/auth/me`                        | Bearer          | Return the authenticated user                      |
| POST   | `/auth/logout`                    | Bearer          | Revoke the current access token                    |
| POST   | `/auth/change-email`              | Bearer          | Request email change (OTP to new address)          |
| POST   | `/auth/cancel-change-email`       | Bearer          | Cancel a pending email change                      |
| POST   | `/auth/verify-change-email`       | Bearer          | Confirm email change with OTP                      |
| POST   | `/auth/set-user-email`            | Bearer `admin`  | Admin sets a user's email directly                 |
| POST   | `/auth/change-password`           | Bearer          | Change own password (requires old password)        |
| POST   | `/auth/set-user-password`         | Bearer `admin`  | Admin sets a user's password                       |
| POST   | `/auth/forgot-password`           | Public          | Start password reset (OTP to email)                |
| POST   | `/auth/retry-forgot-password`     | Public          | Re-issue password-reset OTP                        |
| POST   | `/auth/verify-forgot-password`    | Public          | Reset password with OTP + new password             |
| POST   | `/auth/verify-forgot-password-code` | Public        | Validate a password-reset OTP (without resetting)  |
| POST   | `/auth/verify-user-password`      | Bearer          | Confirm the current user's password                |
| GET    | `/auth/users`                     | Bearer `admin`/`developer` | List users (paginated, filterable)      |
| GET    | `/auth/users/:entity_id`          | Bearer `admin`/`developer` | Fetch a single user                     |

Authorization is enforced by `authorizer(roles?)` (`src/middlewares/authorizer.ts`),
which validates the bearer JWT **and** confirms the token still exists in the
`auth_token` table (so revoked/logged-out tokens are rejected even before expiry).

---

## 2. Request bodies

Validation is done with Zod (`src/modules/user/user.validation.ts`,
`src/modules/auth-token/auth-token.validation.ts`).

```jsonc
// POST /auth/register
{ "email": "user@example.com", "first_name": "Jane", "last_name": "Doe", "password": "<password>" }

// POST /auth/verify-user-email   (token = 6-digit OTP)
{ "email": "user@example.com", "token": "123456" }

// POST /auth/resend-verification-email
{ "email": "user@example.com" }

// POST /auth/login
{ "email": "user@example.com", "password": "<password>" }

// POST /auth/refresh-token   (access_token optional, refresh_token required)
{ "refresh_token": "<jwt>", "access_token": "<jwt>" }

// POST /auth/change-email   (Bearer)
{ "email": "new@example.com" }

// POST /auth/verify-change-email   (Bearer)
{ "token": "123456" }

// POST /auth/change-password   (Bearer)
{ "old_password": "<old>", "new_password": "<new>" }

// POST /auth/forgot-password
{ "email": "user@example.com" }

// POST /auth/verify-forgot-password
{ "email": "user@example.com", "token": "123456", "password": "<new>" }

// POST /auth/set-user-email   (Bearer admin)
{ "user_id": "<uuid>", "new_email": "new@example.com" }

// POST /auth/set-user-password   (Bearer admin)
{ "user_id": "<uuid>", "password": "<new>" }
```

`GET /auth/users` query params: `email`, `search_keyword`, `status`,
`include_entity_ids[]`, `exclude_entity_ids[]`, `limit` (1–100, default 50),
`offset` (default 0).

---

## 3. Response & error shape

Success responses are consistent:

```json
{ "data": { /* ... */ }, "message": "SUCCESS" }
```

Errors are thrown as `CustomError(statusCode, message)` and normalized by the global
error handler. Internal error details are never leaked to clients. Common codes:
`400` (validation/invalid input), `401` (`UNAUTHORIZED` / `MISSING_TOKEN`),
`404` (`USER_DOES_NOT_EXIST`), `409`/`400` (duplicate email), `500` (`UNKNOWN_ERROR`).

---

## 4. Token model

- **Access / refresh tokens** are JWTs, and the live tokens are also persisted in the
  `auth_token` table. `authorizer` checks both signature validity and DB presence.
- **Logout** revokes the presented access token (DB row removed/invalidated), so the
  token can no longer pass `authorizer`.
- **Refresh** exchanges a valid refresh token for a fresh token pair.
- **Verification tokens** (OTP) live in `verification_token` and are 6-digit codes used
  for email verification, email change, and password reset. On use they are marked
  (`verified` / `cancelled`) rather than hard-deleted, preserving an audit trail.

---

## 5. Notification & transaction architecture (important)

Each mutating endpoint runs inside `useTransaction` (`src/db/index.ts`). Email delivery
(AWS SES via `notification.service.ts`) is **decoupled** from the transaction:

- Inside the transaction, notifications are **registered** via
  `runAfterTransactionCommit(() => notificationService.sendNotification(...))`.
- The queued tasks run **only after the transaction commits successfully**.
- If an email send fails, the error is **logged but not rethrown into the request**, so a
  committed change (e.g. a password update) is **not rolled back** by an email failure,
  and SES latency never holds a pooled DB connection open.

This is implemented with an `AsyncLocalStorage` store that collects post-commit tasks
for the current transaction; when called outside a managed transaction, the task runs
immediately.

> **Behavioral tradeoff:** notification/OTP emails are now **best-effort**. If the DB
> write succeeds but the email fails, the API still returns success and the failure is
> logged. For OTP flows, users rely on the resend/retry endpoints. If a flow must
> hard-fail when its email cannot be sent, that needs an explicit per-flow policy.

---

## 6. Verification / test plan

> Status: the auth fixes have passed static checks (`typecheck`, `lint`, `build`) but
> have **not** been verified end-to-end at runtime. Use this plan to gain real
> confidence. Adjust the base URL/port to your environment.

### 6.1 Prerequisites
- Running PostgreSQL with migrations applied (`pnpm db:migrate`).
- Seeds applied so email templates exist (`send_password_changed`, `send_email_changed`,
  verification templates).
- A working SES config for the happy-path runs.
- The `/test/verification-tokens` helper route (dev only) to read issued OTPs without
  inspecting a mailbox.

### 6.2 Happy-path flows
1. **Register → verify → login**
   - `POST /auth/register` → expect `201`, user created.
   - Read the OTP, `POST /auth/verify-user-email` → `200`.
   - `POST /auth/login` → `200` with access + refresh tokens.
2. **Authenticated read** — `GET /auth/me` with the access token → `200`, correct user.
3. **Refresh** — `POST /auth/refresh-token` with the refresh token → `200`, new pair;
   confirm the old access token is rejected if rotated.
4. **Logout** — `POST /auth/logout` → `200`; reusing that access token on `/auth/me`
   must now return `401`.
5. **Change password** — `POST /auth/change-password` → `200`; old password fails login,
   new password succeeds.
6. **Change email** — `change-email` → `verify-change-email`; confirm `email` updated and
   `new_email` cleared.
7. **Forgot password** — `forgot-password` → `verify-forgot-password`; new password works.
8. **Admin** — `set-user-email` / `set-user-password` with an admin token succeed; with a
   non-admin token return `403`.

### 6.3 The critical regression check (notification decoupling)
This validates section 5 — that a committed mutation survives an email failure.

1. Configure SES to **fail** (e.g. invalid credentials or a deliberately missing
   template), keeping the DB healthy.
2. Call `POST /auth/change-password` with valid credentials.
3. **Expected:** response is `200`/success, the password **is actually changed**
   (old password no longer logs in, new one does), and the SES failure appears only in
   server logs as a post-commit error — **no rollback**.
4. Repeat for `verify-change-email` (email must be updated despite the SES failure).

> Before the fix, the SES failure rolled back the password/email change. After the fix,
> the data change persists and only the email is missed.

### 6.4 Negative & edge cases
- Invalid/missing fields → `400` with a descriptive (non-internal) message.
- Wrong OTP / expired OTP → rejected; already-used OTP cannot be reused.
- Protected routes without a bearer token → `401 MISSING_TOKEN`.
- Revoked (logged-out) token → `401`.
- Duplicate email on register / change-email → rejected.
- `GET /auth/users` pagination bounds (`limit` 1–100) and filters behave as specified.

### 6.5 Suggested automation
There is no automated auth test suite yet. Consider adding integration tests (e.g.
Vitest + Supertest against a test database) covering 6.2–6.4, with 6.3 being the highest
value since it guards the notification/transaction decoupling.
