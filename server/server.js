"use strict";

const Datastore = require("@google-cloud/datastore");
const logger = require("winston");
const gstore = require("gstore-node")({ cache: true });

const app = require("./index");
const config = require("./config");

logger.info(
    `Instantiating Datastore instance for project "${config.gcloud.projectId}"`
);
const datastore = new Datastore({
    projectId: config.gcloud.projectId,
    namespace: config.gcloud.datastore.namespace
});

// Connect gstore to the Google Datastore instance
logger.info("Connecting gstore-node to Datastore");
gstore.connect(datastore);

logger.info("Starting server...");
app.listen(config.server.port, error => {
    if (error) {
        logger.error("Unable to listen for connection", error);
        process.exit(10);
    }

    logger.info(`Server started and listening on port ${config.server.port}`);
});
