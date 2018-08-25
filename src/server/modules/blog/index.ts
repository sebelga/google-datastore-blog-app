'use strict';

import { Router } from 'express';
import initRoutes from './blog.routes';
import initBlogPost, { BlogPostModule } from './blog-post';
import initComment, { CommentModule } from './comment';
import { Context, Modules } from './models';

export interface BlogModule {
  webRouter: Router;
  apiRouter: Router;
  blogPost: BlogPostModule;
  comment: CommentModule;
}

export default (context: Context, { images, utils }: Modules): BlogModule => {
  const comment = initComment(context);
  const blogPost = initBlogPost(context, { comment, images, utils });
  const { webRouter, apiRouter } = initRoutes(context, { blogPost, comment });

  return {
    webRouter,
    apiRouter,
    blogPost,
    comment,
  };
};
