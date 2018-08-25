'use strict';

import Storage from '@google-cloud/storage';
import { GcloudConfig } from './config/gcloud';

export default ({ config }: { config: GcloudConfig }) => {
  const storage = new (Storage as any)({ projectId: config.projectId });
  return storage;
};
