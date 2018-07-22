'use strict';

const Routes = require('./routes');
const Handlers = require('./routes-handlers');

module.exports = (context, { blog, images }) => {
  const routesHandlers = Handlers(context, { blog });

  return {
    webRoutes: Routes(context, { routesHandlers, images }),
  };
};
