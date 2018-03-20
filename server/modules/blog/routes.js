"use strict";

const bodyParser = require("body-parser");
const express = require("express");
const logger = require("winston");
const { routesHandlers: routesHandlersBlogPost } = require("./blog-post");
const { routesHandlers: routesHandlersComment } = require("./comment");

const routerWeb = express.Router();
const routerApi = express.Router();

// --------------------------------------------------
// Web
// --------------------------------------------------
/**
 * This route is only for the Demo to clean-up the BlogPost
 * It is executed every 24h by a cron job.
 */
routerWeb.get(
    "/clean-up",
    (req, res, next) => {
        // Validate it is the Cron service
        logger.info("About to clean up BlogPosts...");
        logger.info(`X-Appengine-Cron: ${req.headers["X-Appengine-Cron"]}`);
        logger.info(`ip Cron: ${req.ip}`);
        if (!req.headers["X-Appengine-Cron"] || req.ip !== "10.0.0.1") {
            logger.warn(`The host ${req.ip} tried to clean up BlogPost`);
            return res.status(403).send("Not allowed");
        }
        next();
    },
    routesHandlersBlogPost.cleanUp
);
routerWeb.get("/", routesHandlersBlogPost.index);
routerWeb.get("/:id", routesHandlersBlogPost.detail);

// --------------------------------------------------
// REST API
// --------------------------------------------------
routerApi.delete("/blog/:id", routesHandlersBlogPost.deletePost);
routerApi.get("/blog/:id/comments", routesHandlersComment.getComments);
routerApi.post(
    "/blog/:id/comments",
    bodyParser.json(),
    routesHandlersComment.createComment
);
routerApi.delete("/comments/:id", routesHandlersComment.deleteComment);

module.exports = {
    web: routerWeb,
    api: routerApi
};
