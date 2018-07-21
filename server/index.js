'use strict';

const express = require('express');
const compression = require('compression');
const path = require('path');
const routes = require('./routes');

const app = express();

/**
 * Configure views template, static files, gzip
 */
app.use(compression());
app.set('views', __dirname);
app.set('view engine', 'pug');
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '1 year' }));
app.disable('x-powered-by');

module.exports = context => {
  /**
   * Add routes
   */
  routes(app, context);

  return app;
};
