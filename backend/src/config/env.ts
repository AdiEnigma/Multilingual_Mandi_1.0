import { z } from 'zod';
import { logger } from '@/utils/logger';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).default('8000'),
  
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // Redis
  REDIS_URL: z.string().url('Invalid Redis URL'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // External APIs
  AZURE_TRANSLATOR_KEY: z.string().min(1, 'Azure Translator API key is required'),
  AZURE_TRANSLATOR_REGION: z.string().min(1, 'Azure Translator region is required'),
  AZURE_TRANSLATOR_ENDPOINT: z.string().url('Invalid Azure Translator endpoint').default('https://api.cognitive.microsofttranslator.com'),
  
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  OPENAI_MODEL: z.string().default('gpt-4'),
  
  // URLs
  FRONTEND_URL: z.string().url('Invalid frontend URL'),
  BACKEND_URL: z.string().url('Invalid backend URL'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('10MB'),
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().int().positive()).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().int().positive()).default('100'),
  
  // Session
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  SESSION_MAX_AGE: z.string().transform(Number).pipe(z.number().int().positive()).default('86400000'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // CORS
  CORS_ORIGIN: z.string().url('Invalid CORS origin'),
  
  // WebSocket
  WEBSOCKET_PORT: z.string().transform(Number).pipe(z.number().int().min(1).max(65535)).optional(),
  
  // External APIs (optional for development)
  GOVERNMENT_API_BASE_URL: z.string().url('Invalid government API base URL').optional(),
  INDIAMART_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function validateEnv(): Env {
  try {
    env = envSchema.parse(process.env);
    logger.info('Environment variables validated successfully');
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      logger.error('Environment validation failed:\n' + errorMessages);
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!env) {
    env = validateEnv();
  }
  return env;
}