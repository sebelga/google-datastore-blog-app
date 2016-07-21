'use strict';

const joi = require('joi');

const envVarsSchema = joi.object({
    DATASTORE_NAMESPACE: joi.string().required(),
    GCLOUD_BUCKET: joi.string().required(),
    KEYFILENAME: joi.string().required(),
}).unknown()
    .required();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    datastoreNamespace: envVars.DATASTORE_NAMESPACE,
    storageBucket: envVars.GCLOUD_BUCKET,
    keyFilename: envVars.KEYFILENAME,
};

module.exports = config;
