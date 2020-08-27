const winston = require('winston');
const expressWinston = require('express-winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { env } = require('./vars');

exports.middlewareLogger = expressWinston.logger(env === 'production' ? {
  transports: [
    new DailyRotateFile({
      filename: 'http-%DATE%.log',
      dirname: './logs',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  expressFormat: true,
  requestWhitelist: [...expressWinston.requestWhitelist, 'body'],
  responseWhitelist: [...expressWinston.responseWhitelist, 'body'],
} : {
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
  format: winston.format.colorize(),
  meta: false,
  expressFormat: true,
  colorize: true,
});

exports.logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: env === 'production' ? [
    new DailyRotateFile({
      filename: 'app-%DATE%.log',
      dirname: './logs',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '3d',
    }),
  ] : [
    new winston.transports.Console(),
  ],
});
