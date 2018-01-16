'use strict';

const router = require('express').Router();
const blog = require('./blog-post');

const config = require('../config');
const images = require('../helpers/images');

// ------------------------
// Blog Posts ROUTES
// ------------------------

router.get('/blog', blog.list);
router.get('/blog/:id', blog.get);
// router.get('/blog/create', blog.create);
// router.post('/blog/create', [images.multer.single('image'), images.uploadToGCS], blog.create);

// Api
// ---------
router.delete(`${config.common.apiBase}/blog/:id`, blog.deletePost);

module.exports = router;

// router.route('/blog/:id')
//         .get(blog.get);

// router.route('/admin/blog/new')
//         .get(blog.create)
//         .post(images.multer.single('image'),
//                 images.sendUploadToGCS,
//                 blog.create);

// router.route('/admin/blog/edit/:id')
//         .get(blog.edit)
//         .post(images.multer.single('image'),
//                 images.sendUploadToGCS,
//                 blog.edit);

// router.route('/admin/blog/:id')
//         .get(blog.get)
//         .delete(blog.delete);