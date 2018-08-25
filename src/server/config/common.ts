import joi from 'joi';

const envVarsSchema = joi
  .object({
    NODE_ENV: joi
      .string()
      .valid(['development', 'production', 'test'])
      .required(),
  })
  .unknown();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export type CommonConfig = {
  env: string;
  isTest: boolean;
  isDevelopment: boolean;
  apiBase: string;
};

export const config: CommonConfig = {
  env: envVars.NODE_ENV,
  isTest: envVars.NODE_ENV === 'test',
  isDevelopment: envVars.NODE_ENV === 'development',
  apiBase: '/api/v1',
};
