"use strict";

const bodyParser = require("body-parser");
const express = require("express");
const { routesHandlers: routesHandlersBlogPost } = require("./blog-post");
const { routesHandlers: routesHandlersComment } = require("./comment");

const routerWeb = express.Router();
const routerApi = express.Router();

// --------------------------------------------------
// Web
// --------------------------------------------------
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
