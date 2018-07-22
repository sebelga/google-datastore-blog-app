'use strict';

const DB = require('./blog-post.db');
const Routes = require('./blog-post.routes-handlers');
const Domain = require('./blog-post.domain');

module.exports = (context, { comment, images }) => {
  const db = DB(context, { images });
  const blogPostDomain = Domain({ context }, { db, comment });

  return {
    routesHandlers: Routes(context, { blogPostDomain }),
    blogPostDomain,
  };
};
