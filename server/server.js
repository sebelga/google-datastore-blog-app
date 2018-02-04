"use strict";

const Datastore = require("@google-cloud/datastore");
const logger = require("winston");
const gstore = require("gstore-node")({ cache: true });

const app = require("./index");
const config = require("./config");

const datastore = new Datastore({
    projectId: config.gcloud.projectId,
    namespace: config.gcloud.datastore.namespace,
});

logger.info(`Connecting to Datastore... | project "${config.gcloud.projectId}"`);

// Connect gstore to the Google Datastore instance
gstore.connect(datastore);

logger.info("Server starting...");

app.listen(config.server.port, error => {
    if (error) {
        logger.error("Unable to listen for connection", error);
        process.exit(10);
    }

    logger.info(
        `App listening on port ${config.server.port}`
    );
});
