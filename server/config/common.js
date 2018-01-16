'use strict';

const joi = require('joi');
const log = require('winston');

const envVarsSchema = joi.object({
    NODE_ENV: joi.string()
        .valid(['development', 'production', 'test'])
        .required(),
}).unknown().required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    env: envVars.NODE_ENV,
    isTest: envVars.NODE_ENV === 'test',
    isDevelopment: envVars.NODE_ENV === 'development',
    apiBase: '/api/v1',
};

log.info(`[Environment] current environment is "${config.env}"`);

module.exports = config;
