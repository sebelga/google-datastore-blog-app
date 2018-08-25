'use strict';

import initBlogModule from './modules/blog';
import initAdminModule from './modules/admin';
import initImagesModule from './modules/images';
import initUtilsModule from './modules/utils';

import { Context, AppModules } from './models';

export default (context: Context): AppModules => {
  /**
   * Initialize our module by passing the context & each module dependencies
   */
  const utils = initUtilsModule();
  const images = initImagesModule(context);
  const blog = initBlogModule(context, { images, utils });
  const admin = initAdminModule(context, { blog, images });

  return {
    blog,
    admin,
    images,
    utils,
  };
};
