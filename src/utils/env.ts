// Initiating dotenv
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { ZodError, z } from 'zod';

const stringBoolean = z.coerce
  .string()
  .default('false')
  .transform((val) => val === 'true');

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  API_BASE_URL: z.url({ message: 'API_BASE_URL is invalid' }),
  PORT: z.string().default('8000'),
  DATABASE_URL: z.string().min(1, 'DATABASE URL is required'),
  DB_MIGRATING: stringBoolean,
  DB_SEEDING: stringBoolean,
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_ISSUER: z.string().min(1, 'JWT_ISSUER is required'),
  ACCESS_TOKEN_EXPIRY: z.string().default('1d'),
  REFRESH_TOKEN_EXPIRY: z.string().default('30d'),
  CLIENT_APP_URL: z.url({ message: 'CLIENT_APP_URL is invalid' }),
  FROM_EMAIL: z.string().min(1, 'FROM_EMAIL is required'),
  AWS_ACCESS_KEY: z.string().min(1, 'AWS_ACCESS_KEY is required'),
  AWS_SECRET_KEY: z.string().min(1, 'AWS_SECRET_KEY is required'),
  AWS_REGION: z.string().min(1, 'AWS_REGION is required')
});

export type EnvSchemaType = z.infer<typeof EnvSchema>;

// Expanding environment variables
expand(config());

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = 'Missing required values in .env:\n';
    error.issues.forEach((issue) => {
      message += `${issue.path.join('.')}: ${issue.message}\n`;
    });
    const e = new Error(message);
    e.stack = '';
    throw e;
  }
  console.error(error);
}

export default EnvSchema.parse(process.env);
