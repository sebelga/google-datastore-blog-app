import './env';

import { config as common, CommonConfig } from './common';
import { config as gcloud, GcloudConfig } from './gcloud';
import { config as server, ServerConfig } from './server';
import { config as logger, LoggerConfig } from './logger';

export type Config = {
  common: CommonConfig;
  gcloud: GcloudConfig;
  server: ServerConfig;
  logger: LoggerConfig;
};

export default {
  common,
  gcloud,
  server,
  logger,
};
