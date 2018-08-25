import Storage from '@google-cloud/storage';
import { Logger } from 'winston';

export type Config = {
  gcloud: {
    projectId: string;
    storage: {
      bucket: string;
    };
  };
};

export type Context = {
  logger: Logger;
  config: Config;
  storage: Storage;
};
