'use strict';

const config = require('./config');
const logger = require('./logger')({ config: config.logger });
const gstore = require('./db')({ config: config.gcloud, logger });

const context = { gstore, logger, config };

/**
 * Instantiate the modules used in our application
 */
const modules = require('./modules')(context);

/**
 * Instantiate our app
 */
const app = require('./index')(context, modules);

/**
 * Start server
 */
logger.info('Starting server...');
logger.info(`Environment: "${config.common.env}"`);

app.listen(config.server.port, error => {
  if (error) {
    logger.error('Unable to listen for connection', error);
    process.exit(10);
  }

  logger.info(`Server started and listening on port ${config.server.port}`);
});
