import initDB, { CommentDB } from './comment.db';
import initRoutes, { CommentRoutes } from './comment.routes-handlers';
import initDomain, { CommentDomain } from './comment.domain';
import { Context } from '../models';

export * from './models';

export interface CommentModule {
  commentDB: CommentDB;
  commentDomain: CommentDomain;
  routesHandlers: CommentRoutes;
}

export default (context: Context): CommentModule => {
  const commentDB = initDB(context);
  const commentDomain = initDomain(context, { commentDB });
  const routesHandlers = initRoutes(context, { commentDomain });

  return {
    commentDB,
    commentDomain,
    routesHandlers,
  };
};
