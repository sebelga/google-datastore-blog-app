'use strict';

const router = require('express').Router();

const admin = require('./admin');
const images = require('../../helpers/images');
const dataloaderMiddleware = require('../../middleware/dataloader');

// ------------------------
// Admin ROUTES
// ------------------------
// Add a DataLoader instance on each request
router.use('/admin', dataloaderMiddleware);

// Create routes
router.get('/admin', admin.dashboard);
router.get('/admin/new-post', admin.newPost);
router.post('/admin/new-post', [images.multer.single('image'), images.uploadToGCS], admin.newPost);
router.get('/admin/edit-post/:id', admin.editPost);
router.post('/admin/edit-post/:id', [images.multer.single('image'), images.uploadToGCS], admin.editPost);

module.exports = router;
