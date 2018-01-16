'use strict';

const path = require('path');
const winston = require('winston');

if (process.env.NODE_ENV === 'development') {
    winston.info('Reading ENV variable from ".env" file');
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const common = require('./common');
const gcloud = require('./gcloud');
const server = require('./server');
const logger = require('./logger');

module.exports = Object.assign({}, {
    common,
    logger,
    gcloud,
    server,
});
