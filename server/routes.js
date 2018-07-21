'use strict';

const path = require('path');
const logger = require('winston');

const config = require('./config');
const { webRoutes: blogWebRoutes, apiRoutes: blogApiRoutes } = require('./modules/blog');
const { webRoutes: adminWebRoutes } = require('./modules/admin');

const { apiBase } = config.common;

/**
 * Authentication middleware for the "admin" routes
 * Not implemented, just a starting point for the Demo.
 */
async function authMiddleware(req, _, next) {
  const token = req.headers['x-access-token'];
  if (!token) {
    // return res.status(403).send("Authorization Token missing");
  }
  // ... logic to validate the token and authenticate user
  next();
}

module.exports = app => {
  /**
   * Web Routes
   */
  app.use('/blog', blogWebRoutes);
  app.use('/admin', [authMiddleware], adminWebRoutes);

  /**
   * API Routes
   */
  app.use(apiBase, blogApiRoutes);

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
  app.use((err, _, res) => {
    logger.error(err.output.payload);
    if (err.isServer) {
      // log the error...
      return;
    }
    return res.status(err.output.statusCode).json(err.output.payload);
  });
};
