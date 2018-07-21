'use strict';

const path = require('path');
const log = require('winston');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  /**
   * Read environement variables from .env file
   */
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const common = require('./common');
const gcloud = require('./gcloud');
const server = require('./server');
const logger = require('./logger');

log.info(`App environment: "${process.env.NODE_ENV}"`);

module.exports = {
  common,
  logger,
  gcloud,
  server,
};
