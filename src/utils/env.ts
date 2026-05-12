// Initiating dotenv
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

// Expanding environment variables
expand(config());

// Exporting environment variables
export const PORT = process.env.PORT || 8000;
export const DATABASE_URL = process.env.POSTGRES_URL as string;
export const DB_MIGRATING = process.env.DB_MIGRATING as string;
export const DB_SEEDING = process.env.DB_SEEDING as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_ISSUER = process.env.JWT_ISSUER as string;

export const isProduction = process.env.NODE_ENV === 'production';

export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1d';
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';
export const CLIENT_APP_URL = process.env.CLIENT_APP_URL as string;
export const FROM_EMAIL = process.env.FROM_EMAIL as string;

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY as string;
export const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY as string;
export const AWS_REGION = process.env.AWS_REGION as string;
