'use strict';

const express = require('express');
const path = require('path');

const app = express();
app.set('views', __dirname);
app.set('view engine', 'pug');
app.use('/public', express.static(path.join(__dirname, 'public')));

// Add Routes
require('./routes')(app);

module.exports = app;
