export class EnvConfig {
  APP_PORT: number;

  CLIENT_URL: string;

  DB_HOST: string;
  DB_PORT: number;
  DB_EXPOSE_PORT: number;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DATABASE_URL: string;

  ORIGIN: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_EXPOSE_PORT: number;
  REDIS_PASSWORD: string;

  JWT_SECRET: string;
  JWT_EXPIRATION_TIME: string;

  SALT_ROUNDS: number;
  BCRYPT_ROUNDS: number;

  MAIN_USER_EMAIL: string;
  MAIN_USER_PASSWORD: string;
  MAIN_USER_NAME: string;

  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;

  GOOGLE_CALLBACK_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}
