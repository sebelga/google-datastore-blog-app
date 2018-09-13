import express from 'express';

export default () => {
  const app = express();

  app.use('/', (_, res) => {
    res.send('Hello!');
  });

  return app;
};
