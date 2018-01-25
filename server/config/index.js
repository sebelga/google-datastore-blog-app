'use strict';

const path = require('path');
const log = require('winston');

if (process.env.NODE_ENV === 'development') {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const common = require('./common');
const gcloud = require('./gcloud');
const server = require('./server');
const logger = require('./logger');

log.info(`Environment: "${process.env.NODE_ENV}"`);

module.exports = Object.assign({}, {
    common,
    logger,
    gcloud,
    server,
});
