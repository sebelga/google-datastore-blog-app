"use strict";

const path = require("path");
const gstore = require("gstore-node")();
const logger = require("winston");

const blogPostDomain = require("./blog-post.domain");
const { handleError, pageNotFound } = require("../../exceptions/routes");
const templates = path.join(__dirname, "..", "views");

const { protectedBlogPosts } = blogPostDomain;

const index = async (req, res) => {
    const template = path.join(templates, "index");
    let posts;

    try {
        posts = await blogPostDomain.getPosts();
    } catch (error) {
        return res.render(template, {
            blogPosts: [],
            error
        });
    }

    res.render(template, {
        blogPosts: posts.entities,
        pageId: "home"
    });
};

const detail = async (req, res) => {
    /**
     * Create Dataloader instance, unique to this request
     */
    const dataloader = gstore.createDataLoader();
    const template = path.join(templates, "detail");

    let post;
    try {
        post = await blogPostDomain.getPost(req.params.id, dataloader);
    } catch (error) {
        if (error.code === "ERR_ENTITY_NOT_FOUND") {
            return pageNotFound(res);
        }

        return handleError(res, {
            template,
            error,
            data: { post: null }
        });
    }

    return res.render(template, {
        pageId: "blogpost-view",
        post
    });
};

const deletePost = async (req, res) => {
    let result;

    try {
        result = await blogPostDomain.deletePost(req.params.id);
    } catch (err) {
        return res.status(err.status || 401).end(err.message);
    }

    if (!result.success) {
        return res.status(400).json(result);
    }

    return res.json(result);
};

/**
 * Clean up BlogPost created by users of the Live Demo
 * Executed every 24h by a Cron Job
 */
const cleanUp = async (req, res) => {
    logger.info("Cleaning up BlogPost...");

    let result;
    try {
        result = await blogPostDomain.cleanUp();
    } catch (err) {
        res.status(400).send(err);
    }

    logger.info(result);

    res.send("ok");
};

module.exports = {
    index,
    detail,
    deletePost,
    cleanUp
};
