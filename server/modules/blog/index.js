'use strict';

const { webRoutes, apiRoutes } = require('./routes');
const { blogPostDomain } = require('./blog-post');
const { commentDomain } = require('./comment');

module.exports = {
  webRoutes,
  apiRoutes,
  blogPostDomain,
  commentDomain,
};
