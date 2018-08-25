import { Gstore } from 'gstore-node';
import { Logger } from 'winston';
import { BlogModule } from '../blog/index';
import { ImagesModule } from '../images/index';

export type Context = {
  gstore: Gstore;
  logger: Logger;
};

export type Modules = {
  blog?: BlogModule;
  images?: ImagesModule;
};
