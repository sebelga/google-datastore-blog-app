'use strict';

import path from 'path';
import { Request, Response, NextFunction, Express } from 'express';
import { Context, AppModules } from './models';

/**
 * Authentication middleware for the "admin" routes
 * Not implemented, just a starting point for the Demo.
 */
async function authMiddleware(req: Request, _: Response, next: NextFunction) {
  const token = req.headers['x-access-token'];
  if (!token) {
    // return res.status(403).send("Authorization Token missing");
  }
  // ... logic to validate the token and authenticate user
  next();
}

export default (
  { logger, config }: Context,
  { app, modules: { blog, admin } }: { app: Express; modules: AppModules }
) => {
  const { apiBase } = config.common;
  /**
   * Web Routes
   */
  app.use('/blog', blog.webRouter);
  app.use('/admin', [authMiddleware], admin.webRoutes);

  /**
   * API Routes
   */
  app.use(apiBase, blog.apiRouter);

  /**
   * 404 Page Not found
   */
  app.get('/404', (_, res) => {
    res.render(path.join(__dirname, 'views', '404'));
  });

  /**
   * Default route "/blog"
   */
  app.get('*', (_, res) => res.redirect('/blog'));

  /**
   * Error handling
   */
  app.use((err: any, _: Request, res: Response, next: NextFunction) => {
    const payload = (err.output && err.output.payload) || err;
    const statusCode = (err.output && err.output.statusCode) || 500;

    logger.error(payload);

    if (err.isServer) {
      // log the error...
      return;
    }
    return res.status(statusCode).json(payload);
  });
};
