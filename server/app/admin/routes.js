'use strict';

// const bodyParser = require('body-parser');
const router = require('express').Router();

const adminController = require('./admin');
const images = require('../helpers/images');

// ------------------------
// Admin ROUTES
// ------------------------

router.get('/admin', adminController.dashboard);
// router.get('/admin/new-post', adminController.newPost);
// router.post('/admin/new-post', [images.multer.single('image'), images.uploadToGCS], adminController.newPost);
router.get('/admin/edit-post/:id', adminController.editPost);
router.post('/admin/edit-post/:id', [images.multer.single('image'), images.uploadToGCS], adminController.editPost);

module.exports = router;
