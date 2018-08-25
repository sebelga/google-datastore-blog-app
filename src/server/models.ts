import Storage from '@google-cloud/storage';
import { Gstore } from 'gstore-node';
import { Logger } from 'winston';
import { Config } from './config/index';
import { BlogModule } from './modules/blog';
import { AdminModule } from './modules/admin';
import { ImagesModule } from './modules/images';
import { UtilsModule } from './modules/utils';

export type Context = {
  gstore: Gstore;
  storage: Storage;
  logger: Logger;
  config: Config;
};

export type AppModules = {
  blog: BlogModule;
  admin: AdminModule;
  images: ImagesModule;
  utils: UtilsModule;
};
