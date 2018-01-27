"use strict";

const router = require("express").Router();
const bodyParser = require("body-parser");

const config = require("../../config");
const images = require("../../helpers/images");
const { blogPostCtrl } = require("./blog-post");
const { commentCtrl } = require("./comment");

// Blog Posts ROUTES
// ------------------------
router.get("/blog", blogPostCtrl.list);
router.get("/blog/:id", blogPostCtrl.get);

// API
// ------------------------
const { apiBase } = config.common;

//-- BlogPosts
router.patch(
    `${apiBase}/blog/:id`,
    [bodyParser.json(), images.multer.single("image"), images.uploadToGCS],
    blogPostCtrl.updatePost
);
router.delete(`${apiBase}/blog/:id`, blogPostCtrl.deletePost);

//-- Comments
router.get(`${apiBase}/blog/:id/comments`, commentCtrl.list);
router.post(`${apiBase}/blog/:id/comments`, bodyParser.json(), commentCtrl.create);
router.delete(`${apiBase}/comments/:id`, commentCtrl.deleteComment);

module.exports = router;
