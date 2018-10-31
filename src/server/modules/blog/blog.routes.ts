import bodyParser from 'body-parser';
import express, { Request, Response, NextFunction } from 'express';
import { Context, Modules } from './models';

export default (context: Context, { blogPost, comment }: Modules) => {
  /**
   * The Demo application deployed has a Cron job to clean up BlogPost and Comments created by the users.
   * This middleware makes sure that the request is made by the Google App Engine Cron Job
   */
  const authorizeCronMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const ipAppEngine = req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].indexOf('0.1.0.1') >= 0;
    const cronHeader = !!req.headers['x-appengine-cron'];

    if (!cronHeader || !ipAppEngine) {
      context.logger.warn(`The unauthorized host ${req.ip} tried to clean up BlogPost`);
      return res.status(403).send('Not allowed');
    }

    next();
  };

  // WEB
  const webRouter = express.Router();
  webRouter.get('/clean-up', [authorizeCronMiddleware], blogPost.routesHandlers.cleanUp);
  webRouter.get('/', blogPost.routesHandlers.listPosts);
  webRouter.get('/:id', blogPost.routesHandlers.detailPost);

  // API
  const apiRouter = express.Router();
  apiRouter.delete('/blog/:id', blogPost.routesHandlers.deletePost);
  apiRouter.get('/blog/:id/comments', comment.routesHandlers.getComments);
  apiRouter.post('/blog/:id/comments', bodyParser.json(), comment.routesHandlers.createComment);
  apiRouter.delete('/comments/:id', comment.routesHandlers.deleteComment);

  return {
    webRouter,
    apiRouter,
  };
};
