import { createLogger, format, transports, Logger } from 'winston';
import { LoggerConfig } from './config/logger';

const { combine, timestamp, printf } = format;

export default ({ config }: { config: LoggerConfig }): Logger => {
  const myFormat = printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
  });

  const logger = createLogger({
    level: config.level,
    format: combine(timestamp(), myFormat),
    transports: [new transports.Console({ format: format.simple() })],
  });

  return logger;
};
