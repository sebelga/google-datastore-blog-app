'use strict';

const blogRoutes = require('./modules/blog/routes');
const adminRoutes = require('./modules/admin/routes');

module.exports = (app) => {
    app.use(blogRoutes);
    app.use(adminRoutes);

    /**
     * Default to "/blog"
     */
    app.use((req, res) => res.redirect("/blog"));
};
