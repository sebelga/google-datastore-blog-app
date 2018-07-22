'use strict';

const express = require('express');
const compression = require('compression');
const path = require('path');
const routes = require('./routes');

module.exports = (context, modules) => {
  const app = express();

  /**
   * Configure views template, static files, gzip
   */
  app.use(compression());
  app.set('views', __dirname);
  app.set('view engine', 'pug');
  app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '1 year' }));
  app.disable('x-powered-by');

  /**
   * Add routes to our application
   */
  routes(context, { app, modules });

  return app;
};
