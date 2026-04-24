import z from "zod";

const booleanString = (defaultValue: boolean = false) =>
  z
    .string()
    .default(String(defaultValue))
    .transform((val) => val.toLowerCase() === "true");

export const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  APP_PORT: z.coerce.number().default(2000),

  CLIENT_URL: z.string(),

  ORIGIN: z.string().optional(),

  PRISMA_LOGGING: booleanString(false),
  VALIDATION_LOGGING: booleanString(false),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string(),

  S3_ENDPOINT: z.string(),
  S3_REGION: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_BUCKET: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string().default("10m"),

  SALT_ROUNDS: z.coerce.number().default(10),
  BCRYPT_ROUNDS: z.coerce.number().default(10),

  MAIN_USER_EMAIL: z.string(),
  MAIN_USER_PASSWORD: z.string(),
  MAIN_USER_NAME: z.string(),

  EMAIL_SERVICE: z.string().optional(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.coerce.number(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_SECURE: booleanString(true),
  EMAIL_IGNORE_TLS: booleanString(false),

  GOOGLE_CALLBACK_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export type EnvConfig = z.infer<typeof EnvSchema>;
