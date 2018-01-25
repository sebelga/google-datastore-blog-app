"use strict";

const path = require("path");

const blogRoutes = require("./modules/blog/routes");
const adminRoutes = require("./modules/admin/routes");

module.exports = app => {
    app.use(blogRoutes);
    app.use(adminRoutes);

    /**
     * Error handling
     */
    app.use("/404", (req, res) => {
        res.render(path.join(__dirname, "views", "404"));
    });

    /**
     * Error handling
     */
    app.use((err, req, res, next) => {
        console.log(err);
    });

    /**
     * Default to "/blog"
     */
    app.use((req, res) => res.redirect("/blog"));
};
