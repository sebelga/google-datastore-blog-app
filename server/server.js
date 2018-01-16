'use strict';

const logger = require('winston');
const gstore = require('gstore-node')();

const app = require('./index');
const config = require('./config');

const datastore = require('@google-cloud/datastore')({
    namespace: config.gcloud.datastoreNamespace,
    keyFilename: config.gcloud.keyFilename,
});

// Connect gstore to the Google Datastore instance
gstore.connect(datastore);

logger.info('Server process starting...');

app.listen(config.server.port, config.server.ip, (error) => {
    if (error) {
        logger.error('Unable to listen for connections', error);
        process.exit(10);
    }

    logger.info(`server is listening on http://${config.server.ip}:${config.server.port}`);
});
