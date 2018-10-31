import express, { Router } from 'express';
import { Context, Modules } from './models';
import { AdminRoutesHandlers } from './admin.routes-handlers';

export default (_: Context, routesHandlers: AdminRoutesHandlers, { images }: Modules): Router => {
  const router = express.Router();

  router.get('/', routesHandlers.dashboard);
  router.get('/create-post', routesHandlers.createPost);
  router.get('/edit-post/:id', routesHandlers.editPost);
  router.post('/create-post', [images.upload.single('image'), images.uploadToGCS], routesHandlers.createPost);
  router.post('/edit-post/:id', [images.upload.single('image'), images.uploadToGCS], routesHandlers.editPost);

  return router;
};
