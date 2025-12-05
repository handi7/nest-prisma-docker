# NestJS Prisma Docker Boilerplate

A robust boilerplate for building scalable backend applications using **NestJS**, **Prisma**, and **PostgreSQL**, fully containerized with **Docker**.

## 🚀 Features

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma ORM**: Next-generation Node.js and TypeScript ORM for PostgreSQL.
- **PostgreSQL**: Powerful, open source object-relational database system.
- **Docker & Docker Compose**: Containerization for consistent development and production environments.
- **Authentication**:
  - JWT (JSON Web Token) Authentication.
  - Google OAuth2 Integration.
  - Role-Based Access Control (RBAC) with Permissions.
- **User Management**:
  - User Registration & Login.
  - Password Reset Flow (Email-based).
  - User Invitation System.
- **Validation**: Request validation using `class-validator` and `class-transformer`.
- **Email Service**: Integrated email sending capabilities (using `nodemailer`).

## 🛠️ Tech Stack

- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [Passport](http://www.passportjs.org/)
- [RxJS](https://rxjs.dev/)

## 📂 Project Structure

```
nest-prisma-docker/
├── prisma/              # Prisma schema and migrations
├── src/
│   ├── common/          # Shared decorators, filters, guards, etc.
│   ├── modules/         # Application modules (Auth, User, Role, etc.)
│   ├── services/        # Shared services (Email, etc.)
│   ├── types/           # Custom type definitions
│   ├── app.module.ts    # Main application module
│   └── main.ts          # Application entry point
├── test/                # E2E tests
├── Dockerfile           # Docker configuration for the app
├── docker-compose.yml   # Docker Compose configuration
└── package.json         # Dependencies and scripts
```

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose
- [Yarn](https://yarnpkg.com/) (optional, but recommended)

### Environment Setup

1.  Clone the repository.
2.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
3.  Update `.env` with your configuration (Database credentials, JWT secret, Email settings, etc.).

### Running with Docker (Recommended)

Start the application and database containers:

```bash
# Development mode
yarn dev:d
# OR
npm run dev:d
```

This command will:

1.  Generate Prisma client.
2.  Build and start the containers.
3.  Watch for file changes.

To stop the containers and remove volumes:

```bash
yarn dev-clean:d
# OR
npm run dev-clean:d
```

### Running Locally

1.  Install dependencies:

    ```bash
    yarn install
    ```

2.  Start the database (you can use the docker-compose file just for the DB if you wish, or a local Postgres instance).

3.  Run migrations and generate Prisma client:

    ```bash
    yarn migrate
    yarn generate
    ```

4.  Start the application:

    ```bash
    # Development
    yarn start:dev

    # Production
    yarn start:prod
    ```

## 📜 Scripts

| Script           | Description                                 |
| :--------------- | :------------------------------------------ |
| `yarn start:dev` | Starts the app in watch mode.               |
| `yarn dev:d`     | Starts the app and DB in Docker (dev mode). |
| `yarn migrate`   | Runs Prisma migrations.                     |
| `yarn generate`  | Generates Prisma client.                    |
| `yarn test`      | Runs unit tests.                            |
| `yarn test:e2e`  | Runs end-to-end tests.                      |
| `yarn lint`      | Lints the codebase.                         |

## 🛡️ Authentication & RBAC

The application uses **Passport** for authentication strategies.

- **JWT Strategy**: Used for protecting API endpoints.
- **Google Strategy**: Used for OAuth2 login.

**RBAC (Role-Based Access Control)** is implemented using `Roles` and `Permissions`.

- **Roles**: Define a set of permissions (e.g., Admin, User).
- **Permissions**: Granular access rights (e.g., `create_user`, `view_role`).

## 📧 Email Service

The project includes an email service for sending transactional emails (e.g., password reset, welcome emails). Ensure you configure the `MAIL_*` environment variables in `.env`.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.
