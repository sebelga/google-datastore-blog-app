"use strict";

const joi = require("joi");

const envVarsSchema = joi
    .object({
        GOOGLE_CLOUD_PROJECT: joi.string().required(),
        GCLOUD_BUCKET: joi.string().required(),
        DATASTORE_NAMESPACE: joi.string()
    })
    .unknown();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    projectId: envVars.GOOGLE_CLOUD_PROJECT,
    datastore: {
        namespace: envVars.DATASTORE_NAMESPACE
    },
    storage: {
        bucket: envVars.GCLOUD_BUCKET
    }
};

module.exports = config;
