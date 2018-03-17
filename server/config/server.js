"use strict";

const joi = require("joi");

const envVarsSchema = joi
    .object({
        PORT: joi.number().default(8080)
    })
    .unknown();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    port: Number(envVars.PORT)
};

module.exports = config;
