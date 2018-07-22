'use strict';

const path = require('path');

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

module.exports = ({ logger, config }, { app, modules: { blog, admin } }) => {
  const { apiBase } = config.common;

  /**
   * Web Routes
   */
  app.use('/blog', blog.webRoutes);
  app.use('/admin', [authMiddleware], admin.webRoutes);

  /**
   * API Routes
   */
  app.use(apiBase, blog.apiRoutes);

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
