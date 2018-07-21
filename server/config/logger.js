'use strict';

const joi = require('joi');
const winston = require('winston');

const envVarsSchema = joi
  .object({
    LOGGER_LEVEL: joi
      .string()
      .allow(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
      .default('info'),
    LOGGER_ENABLED: joi
      .boolean()
      .truthy('TRUE')
      .truthy('true')
      .falsy('FALSE')
      .falsy('false')
      .default(true),
  })
  .unknown();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

winston.level = envVars.LOGGER_LEVEL;

if (!envVars.LOGGER_ENABLED) {
  winston.remove(winston.transports.Console);
}

module.exports = {
  logger: {
    level: envVars.LOGGER_LEVEL,
    enabled: envVars.LOGGER_ENABLED,
  },
};
