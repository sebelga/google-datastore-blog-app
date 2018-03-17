"use strict";

const router = require("express").Router();

const routesHandlers = require("./routes-handlers");
const images = require("../../helpers/images");

// ------------------------
// Admin ROUTES
// ------------------------
router.get("/", routesHandlers.dashboard);
router.get("/create-post", routesHandlers.createPost);
router.get("/edit-post/:id", routesHandlers.editPost);
router.post(
    "/create-post",
    [images.upload.single("image"), images.uploadToGCS], // Middlewares to upload image
    routesHandlers.createPost
);
router.post(
    "/edit-post/:id",
    [images.upload.single("image"), images.uploadToGCS],
    routesHandlers.editPost
);

module.exports = router;
