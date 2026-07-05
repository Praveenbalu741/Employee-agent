/**
 * config/logger.js — Winston logger configuration
 */

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, json } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [
    // Console transport with colors (dev only)
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      ),
    }),
    // File transports for persistent logs
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add http level for morgan integration
logger.http = (msg) => logger.log('http', msg);

module.exports = logger;
