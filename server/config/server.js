"use strict";

const joi = require("joi");

const envVarsSchema = joi
    .object({
        PORT: joi.number(),
    })
    .unknown()
    .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    port: Number(envVars.PORT) || 8080,
};

module.exports = config;
