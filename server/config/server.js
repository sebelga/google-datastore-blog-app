'use strict';

const joi = require('joi');

const envVarsSchema = joi.object({
    PORT: joi.number()
        .required(),
    SERVER_IP: joi.string()
                .required(),
    SERVER_HOST: joi.string()
                .required(),
}).unknown()
    .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    port: Number(envVars.PORT) || 3069,
    ip: envVars.SERVER_IP,
    host: envVars.SERVER_HOST,
};

module.exports = config;