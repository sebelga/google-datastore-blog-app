"use strict";

const path = require("path");
const logger = require("winston");

const config = require("./config");
const { routes: blogRoutes } = require("./modules/blog");
const { routes: adminRoutes } = require("./modules/admin");

const { apiBase } = config.common;
const { web: webBlogRoutes, api: apiBlogRoutes } = blogRoutes;

/**
 * Authentication middleware for the "admin" routes
 * Not implemented, just a starting point for the Demo.
 * @param {*} req Http Request object
 * @param {*} res Http Response object
 * @param {*} next Callback to call next middleware
 */
async function authenticate(req, res, next) {
    const token = req.headers["x-access-token"];
    if (!token) {
        // We disable authentication for the Demo
        // return res.status(404).send("Authorization Token missing");
    }

    // ... logic to validate the token

    next();
}

module.exports = app => {
    /**
     * Application Routes
     */
    app.use("/blog", webBlogRoutes);
    app.use("/admin", [authenticate], adminRoutes);
    app.use(apiBase, apiBlogRoutes);

    /**
     * 404 Page Not found
     */
    app.get("/404", (req, res) => {
        res.render(path.join(__dirname, "views", "404"));
    });

    /**
     * Default route "/blog"
     */
    app.get("*", (req, res) => res.redirect("/blog"));

    /**
     * Error handling
     */
    app.use((err, req, res, next) => {
        logger.error(err.message);
        const status = err.status || 500;
        res.status(status).send(err);
    });
};
