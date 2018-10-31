import { Context } from './models';

import initImagesMiddleware, { ImagesMiddleware } from './middlewares';
import initGCS, { GoogleCloudStorage } from './google-cloud-storage';

export interface ImagesModule {
  middlewares: ImagesMiddleware;
  GCS: GoogleCloudStorage;
}

export default (context: Context): ImagesModule => {
  const GCS = initGCS(context);
  const middlewares = initImagesMiddleware(GCS);

  return {
    middlewares,
    GCS,
  };
};
