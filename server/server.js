'use strict';

const config = require('./config');
const db = require('./db');
const logger = require('./logger');
const app = require('./index')({ db, logger });

logger.info('Starting server...');
logger.info(`Environment: "${config.common.env}"`);

app.listen(config.server.port, error => {
  if (error) {
    logger.error('Unable to listen for connection', error);
    process.exit(10);
  }

  logger.info(`Server started and listening on port ${config.server.port}`);
});
