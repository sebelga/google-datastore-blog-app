'use strict';

const DB = require('./comment.db');
const Routes = require('./comment.routes-handlers');
const Domain = require('./comment.domain');

module.exports = context => {
  const db = DB(context);
  const commentDomain = Domain(context, { db });

  return {
    commentDomain,
    routesHandlers: Routes(context, { commentDomain }),
  };
};
