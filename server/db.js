'use strict';

const Datastore = require('@google-cloud/datastore');
const gstore = require('gstore-node')({ cache: true });

module.exports = ({ config, logger }) => {
  logger.info(`Instantiating Datastore instance for project "${config.projectId}"`);

  /**
   * Create Datastore client instance
   */
  const datastore = new Datastore({
    projectId: config.projectId,
    namespace: config.datastore.namespace,
  });

  /**
   * Connect gstore to the Google Datastore instance
   */
  logger.info('Connecting gstore-node to Datastore');
  gstore.connect(datastore);

  return gstore;
};
