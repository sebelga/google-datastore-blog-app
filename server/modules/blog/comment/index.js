'use strict';

const DB = require('./comment.db');
const routes = require('./comment.routes-handlers');
const domain = require('./comment.domain');

module.exports = context => {
  const db = DB(context);
  const commentDomain = domain(context, { db });

  return {
    commentDomain,
    routesHandlers: routes(context, { commentDomain }),
  };
};
