'use strict';

const config = require('./config');

const logger = require('winston');

const app = require('./index');
require('./db');

logger.info('Starting server...');
app.listen(config.server.port, error => {
  if (error) {
    logger.error('Unable to listen for connection', error);
    process.exit(10);
  }

  logger.info(`Server started and listening on port ${config.server.port}`);
});
