import joi from 'joi';

const envVarsSchema = joi
  .object({
    PORT: joi.number().default(8080),
  })
  .unknown();

const { error, value: envVars } = joi.validate(process.env, envVarsSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export type ServerConfig = {
  port: number;
};

export const config: ServerConfig = {
  port: Number(envVars.PORT),
};
