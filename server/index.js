'use strict';

const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();

/**
 * Configure views template & static files
 */
app.set('views', __dirname);
app.set('view engine', 'pug');
app.use('/public', express.static(path.join(__dirname, 'public'), { maxAge: '1 year' }));

/**
 * Add routes
 */
routes(app);

module.exports = app;
