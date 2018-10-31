import initDB from './blog-post.db';
import initRoutes, { BlogPostRoutesHandlers } from './blog-post.routes-handlers';
import initDomain, { BlogPostDomain } from './blog-post.domain';
import { Context, Modules } from '../models';

export * from './models';

export interface BlogPostModule {
  blogPostDomain: BlogPostDomain;
  routesHandlers: BlogPostRoutesHandlers;
}

export default (context: Context, modules: Modules): BlogPostModule => {
  const blogPostDB = initDB(context, modules);
  const blogPostDomain = initDomain(context, { blogPostDB, ...modules });

  return {
    blogPostDomain,
    routesHandlers: initRoutes(context, { blogPostDomain }),
  };
};
