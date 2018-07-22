'use strict';

const bodyParser = require('body-parser');
const express = require('express');

module.exports = ({ logger }, { blogPost, comment }) => {
  /**
   * The Demo application deployed has a Cron job to clean up BlogPost and Comments created
   * every 24h. This middleware validates that the request is made by a App Engine Cron Job
   */
  const authorizeCronMiddleware = (req, res, next) => {
    const ipAppEngine = req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].indexOf('0.1.0.1') >= 0;
    const cronHeader = !!req.headers['x-appengine-cron'];

    if (!cronHeader || !ipAppEngine) {
      logger.warn(`The unauthorized host ${req.ip} tried to clean up BlogPost`);
      return res.status(403).send('Not allowed');
    }

    next();
  };

  // WEB
  const webRouter = express.Router();
  webRouter.get('/', blogPost.routesHandlers.listPosts);
  webRouter.get('/:id', blogPost.routesHandlers.detailPost);
  webRouter.get('/clean-up', [authorizeCronMiddleware], blogPost.routesHandlers.cleanUp);

  // API
  const apiRouter = express.Router();
  apiRouter.delete('/blog/:id', blogPost.routesHandlers.deletePost);
  apiRouter.get('/blog/:id/comments', comment.routesHandlers.getComments);
  apiRouter.post('/blog/:id/comments', bodyParser.json(), comment.routesHandlers.createComment);
  apiRouter.delete('/comments/:id', comment.routesHandlers.deleteComment);

  return {
    webRoutes: webRouter,
    apiRoutes: apiRouter,
  };
};
