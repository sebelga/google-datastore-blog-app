import joi from 'joi';

const envVarsSchema = joi
  .object({
    GOOGLE_CLOUD_PROJECT: joi.string().required(),
    GCLOUD_BUCKET: joi.string().required(),
    DATASTORE_NAMESPACE: joi.string(),
  })
  .unknown();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export type GcloudConfig = {
  projectId: string;
  datastore: {
    namespace: string;
  };
  storage: {
    bucket: string;
  };
};

export const config: GcloudConfig = {
  projectId: envVars.GOOGLE_CLOUD_PROJECT,
  datastore: {
    namespace: envVars.DATASTORE_NAMESPACE,
  },
  storage: {
    bucket: envVars.GCLOUD_BUCKET,
  },
};
