import initDB from './comment.db';
import initRoutes, { CommentRoutes } from './comment.routes-handlers';
import initDomain, { CommentDomain } from './comment.domain';
import { Context } from '../models';

export * from './models';

export interface CommentModule {
  commentDomain: CommentDomain;
  routesHandlers: CommentRoutes;
}

export default (context: Context): CommentModule => {
  const commentDB = initDB(context);
  const commentDomain = initDomain(context, { commentDB });

  return {
    commentDomain,
    routesHandlers: initRoutes(context, { commentDomain }),
  };
};
