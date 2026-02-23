# NestJS Prisma Docker Boilerplate

Backend boilerplate built with NestJS, Prisma, and PostgreSQL, with Docker-first development and shared infrastructure for Redis, email, and S3-compatible file storage.

## Features

- JWT authentication with refresh-token sessions stored in Redis.
- Google OAuth flow endpoints and callback redirect support.
- RBAC with roles and permission codes.
- User invite flow (create invite, validate token, accept invite).
- Forgot password and reset password via email templates.
- Prisma ORM with migration and seeding support.
- Global response envelope and centralized HTTP error formatting.
- Request validation using Zod schemas via custom interceptor.
- S3-compatible file utilities (upload, signed/public URL, delete).

## Tech Stack

- NestJS 10
- Prisma 7 + PostgreSQL
- Redis (ioredis)
- AWS SDK S3 client (works with S3-compatible providers like MinIO)
- Nodemailer via `@nestjs-modules/mailer` + Handlebars templates
- Docker + Docker Compose

## Project Structure

```text
nest-prisma-docker/
├── prisma/                 # Prisma schema, migrations, seeders
├── generated/prisma/       # Generated Prisma client output
├── src/
│   ├── common/             # Decorators, guards, filters, interceptors, helpers
│   ├── config/             # Permission constants
│   ├── modules/            # Feature modules: auth, role, user, user-invite
│   ├── services/           # Infra services: prisma, redis, email, s3
│   ├── app.module.ts       # Root module
│   └── main.ts             # Bootstrap
├── test/                   # E2E setup
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn
- Docker and Docker Compose (recommended)

### 1) Environment Setup

```bash
cp .env.example .env
```

Fill required values in `.env`, especially DB/Redis/JWT/email and default admin credentials.

### 2) Run with Docker (Recommended)

```bash
yarn dev:d
```

This starts app + PostgreSQL + Redis with build.

To clean containers/volumes and rebuild:

```bash
yarn dev-clean:d
```

### 3) Run Locally

1. Install dependencies:

```bash
yarn
```

2. Ensure PostgreSQL and Redis are running.

3. Run migrations and generate Prisma client:

```bash
yarn migrate
yarn generate
```

4. (Optional but recommended) run seeders:

```bash
yarn seed
```

5. Start app in dev mode:

```bash
yarn dev
```

App listens on `APP_PORT` (default in code fallback is `2000`).

## Available Scripts

| Script              | Description                                  |
| :------------------ | :------------------------------------------- |
| `yarn dev`          | Start Nest app in watch mode                 |
| `yarn dev:generate` | Generate Prisma client then start watch mode |
| `yarn build`        | Build app to `dist`                          |
| `yarn start:prod`   | Generate Prisma client then run built app    |
| `yarn generate`     | Generate Prisma client                       |
| `yarn migrate`      | Run Prisma migrate dev                       |
| `yarn seed`         | Execute Prisma seeders                       |
| `yarn dev:d`        | Docker dev startup (build + up)              |
| `yarn dev-clean:d`  | Docker cleanup + rebuild + up                |
| `yarn prod:d`       | Docker production target                     |
| `yarn test`         | Run unit tests                               |
| `yarn test:e2e`     | Run e2e tests                                |
| `yarn lint`         | Lint and fix                                 |

## API Overview

### Auth

- `POST /auth/login`
- `POST /auth/refresh-token`
- `GET /auth/google`
- `GET /auth/google/callback`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### User

- `GET /users`
- `GET /user/:id`
- `PATCH /user/:id`

### Role

- `POST /role`
- `GET /roles`
- `PATCH /role/:id`
- `DELETE /role/:id`

### User Invite

- `POST /user-invite`
- `GET /user-invites`
- `GET /user-invite/:token` (public)
- `POST /user-invite/accept` (public)

## Response and Validation Behavior

- Successful responses are wrapped by a global response interceptor with metadata fields such as `success`, `statusCode`, `message`, `data`, and `meta`.
- HTTP errors are normalized by a global exception filter with `success: false` and structured `error` payload.
- Request-body validation for selected endpoints is done with Zod schemas (`@ZodSchema(...)`), not `class-validator`.

## RBAC and Seeding

- Permissions are defined in `src/config/permissions.ts`.
- On application bootstrap, permission and role seeders run to sync core RBAC data.
- `yarn seed` runs full seeders including initial super admin user creation.
- Required env for super admin seeding: `MAIN_USER_EMAIL`, `MAIN_USER_PASSWORD`, `MAIN_USER_NAME`.

## Environment Variables

Use `.env.example` as baseline. Key variables:

- App: `APP_PORT`, `CLIENT_URL`, `ORIGIN`
- Database: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Auth: `JWT_SECRET`, `JWT_EXPIRATION_TIME`, `BCRYPT_ROUNDS`
- Email: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- S3: `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`

## Current Limitations

- `PATCH /role/:id` and `DELETE /role/:id` handlers are placeholders in service logic.
- `UpdateUserSchema` is currently empty, so user update validation is not yet defined.
- Google strategy file exists, but strategy provider wiring in auth module should be reviewed before relying on OAuth in production.

## License

MIT
