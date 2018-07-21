'use strict';

const Datastore = require('@google-cloud/datastore');
const gstore = require('gstore-node')({ cache: true });

const config = require('./config');
const logger = require('./logger');

logger.info(`Instantiating Datastore instance for project "${config.gcloud.projectId}"`);

/**
 * Create Datastore client instance
 */
const datastore = new Datastore({
  projectId: config.gcloud.projectId,
  namespace: config.gcloud.datastore.namespace,
});

/**
 * Connect gstore to the Google Datastore instance
 */
logger.info('Connecting gstore-node to Datastore');
gstore.connect(datastore);
