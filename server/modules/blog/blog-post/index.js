'use strict';

const DB = require('./blog-post.db');
const routes = require('./blog-post.routes-handlers');
const domain = require('./blog-post.domain');

module.exports = (context, { comment, images }) => {
  const db = DB(context, { images });
  const blogPostDomain = domain({ context }, { db, comment });

  return {
    routesHandlers: routes(context, { blogPostDomain }),
    blogPostDomain,
  };
};
