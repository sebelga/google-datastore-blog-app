process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import initApp from './app';

/**
 * Instantiate the Express App
 */
const app = initApp();

app.listen(3000, () => {
  console.log('Server started at localhost:3000');
});
