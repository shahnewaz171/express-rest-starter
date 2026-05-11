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
