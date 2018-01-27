'use strict';

const joi = require('joi');

const envVarsSchema = joi.object({
    GCLOUD_PROJECT: joi.string().required(),
    DATASTORE_NAMESPACE: joi.string().required(),
    GCLOUD_BUCKET: joi.string().required(),
}).unknown()
    .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    projectId: envVars.GCLOUD_PROJECT,
    datastoreNamespace: envVars.DATASTORE_NAMESPACE,
    storageBucket: envVars.GCLOUD_BUCKET,
};

module.exports = config;
