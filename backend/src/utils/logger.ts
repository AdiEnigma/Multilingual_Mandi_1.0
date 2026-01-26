import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'marketplace-mandi-backend' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Add console transport for production with JSON format
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  }));
}

// Create a stream object for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Utility functions for structured logging
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logInfo = (message: string, meta?: Record<string, any>) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: Record<string, any>) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, any>) => {
  logger.debug(message, meta);
};

// Request logging utility
export const logRequest = (req: any, res: any, responseTime?: number) => {
  const logData = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Database operation logging
export const logDatabaseOperation = (
  operation: string,
  table: string,
  duration?: number,
  error?: Error
) => {
  const logData = {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
  };

  if (error) {
    logger.error(`Database ${operation} failed`, {
      ...logData,
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger.debug(`Database ${operation} completed`, logData);
  }
};

// External API logging
export const logExternalAPI = (
  service: string,
  endpoint: string,
  method: string,
  statusCode?: number,
  duration?: number,
  error?: Error
) => {
  const logData = {
    service,
    endpoint,
    method,
    statusCode,
    duration: duration ? `${duration}ms` : undefined,
  };

  if (error) {
    logger.error(`External API call failed`, {
      ...logData,
      error: error.message,
    });
  } else if (statusCode && statusCode >= 400) {
    logger.warn(`External API call returned error`, logData);
  } else {
    logger.info(`External API call completed`, logData);
  }
};