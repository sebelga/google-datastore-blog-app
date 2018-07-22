'use strict';

const routes = require('./routes');
const handlers = require('./routes-handlers');

module.exports = (context, { blog, images }) => {
  const routesHandlers = handlers(context, { blog });

  return {
    webRoutes: routes(context, { routesHandlers, images }),
  };
};
