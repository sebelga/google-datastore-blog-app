'use strict';

const { createLogger, format, transports } = require('winston');
const { logger: loggerConfig } = require('./config');

const { combine, timestamp, printf } = format;

const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: loggerConfig.level,
  format: combine(timestamp(), myFormat),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
    new transports.Console({ format: format.simple() }),
  ],
});

module.exports = logger;
