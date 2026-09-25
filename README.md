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
- Swagger/OpenAPI docs at `/docs`, generated from the same Zod schemas that validate requests.
- S3-compatible file utilities (upload, signed/public URL, delete).

## Tech Stack

- NestJS 11
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

- Node.js 22.9+ and npm 11.17 (see `engines` in `package.json`)
- Docker and Docker Compose (recommended)

### 1) Environment Setup

```bash
cp .env.example .env
```

Fill required values in `.env`, especially DB/Redis/JWT/email and default admin credentials.

### 2) Run with Docker (Recommended)

```bash
npm run docker:dev
```

This starts app + PostgreSQL + Redis with build.

To clean containers/volumes and rebuild:

```bash
npm run docker:dev-clean
```

### 3) Run Locally

1. Install dependencies:

```bash
npm ci
```

2. Ensure PostgreSQL and Redis are running.

3. Run migrations and generate Prisma client:

```bash
npm run migrate
```

4. (Optional but recommended) run seeders:

```bash
npm run seed
```

5. Start app in dev mode:

```bash
npm run dev
```

App listens on `APP_PORT` (default in code fallback is `2000`). API docs are served at
`/docs` (JSON spec at `/docs/json`) outside production; set `SWAGGER_ENABLED=true` to turn them
on in production.

## Available Scripts

| Script                     | Description                                          |
| :------------------------- | :--------------------------------------------------- |
| `npm run dev`              | Start Nest app in watch mode                         |
| `npm run dev:generate`     | Generate Prisma client then start watch mode         |
| `npm run build`            | Build app to `dist` (entry: `dist/src/main.js`)      |
| `npm run start:prod`       | Run the built app                                    |
| `npm run generate`         | Generate Prisma client                               |
| `npm run migrate`          | Run Prisma migrate dev, then generate                |
| `npm run seed`             | Execute Prisma seeders                               |
| `npm run docker:dev`       | Docker dev startup (build + up)                      |
| `npm run docker:dev-clean` | Docker cleanup + rebuild + up                        |
| `npm run docker:prod`      | Docker production target                             |
| `npm run docker:migrate`   | Run migrate inside the dev container                 |
| `npm run docker:seed`      | Run seeders inside the dev container                 |
| `npm run lock:fix`         | Rewrite `package-lock.json` with the pinned npm      |
| `npm test`                 | Run unit tests                                       |
| `npm run test:e2e`         | Run e2e tests                                        |
| `npm run lint`             | Lint and fix                                         |

### Docker targets

| Target        | Purpose                                                                 |
| :------------ | :---------------------------------------------------------------------- |
| `development` | Watch mode; used by `docker compose` by default                         |
| `migration`   | One-off `prisma migrate deploy` job, run before rolling out the app     |
| `production`  | Built app + production dependencies only, runs as a non-root user       |

Environment variables are never baked into an image: pass them at runtime (`--env-file`,
orchestrator secrets, or `env_file` in compose).

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
- `npm run seed` runs full seeders including initial super admin user creation.
- Required env for super admin seeding: `MAIN_USER_EMAIL`, `MAIN_USER_PASSWORD`, `MAIN_USER_NAME`.

## Environment Variables

Use `.env.example` as baseline. Key variables:

- App: `APP_PORT`, `CLIENT_URL`, `APP_ORIGINS`, `SWAGGER_ENABLED`
  - CORS allows the origin of `CLIENT_URL` plus every entry in `APP_ORIGINS`.
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
