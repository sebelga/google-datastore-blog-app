'use strict';

const blogRoutes = require('./blog/routes');
const adminRoutes = require('./admin/routes');

module.exports = (app) => {
    app.use('/api/v1', blogRoutes);
    app.use(blogRoutes);
    app.use(adminRoutes);
};
