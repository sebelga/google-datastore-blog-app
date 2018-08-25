import { createLogger, format, transports } from 'winston';
import { LoggerConfig } from './config/logger';

const { combine, timestamp, printf } = format;

export default ({ config }: { config: LoggerConfig }) => {
  const myFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
  });

  const logger = createLogger({
    level: config.level,
    format: combine(timestamp(), myFormat),
    transports: [
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' }),
      new transports.Console({ format: format.simple() }),
    ],
  });

  return logger;
};
