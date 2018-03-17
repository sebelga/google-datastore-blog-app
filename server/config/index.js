"use strict";

const path = require("path");
const log = require("winston");

if (process.env.NODE_ENV === "development") {
    /**
     * Read environement variables from .env file
     */
    require("dotenv").config({ path: path.join(__dirname, "../.env") });
}

const common = require("./common");
const gcloud = require("./gcloud");
const server = require("./server");
const logger = require("./logger");

log.info(`Current environment: "${process.env.NODE_ENV}"`);

module.exports = Object.assign(
    {},
    {
        common,
        logger,
        gcloud,
        server
    }
);
