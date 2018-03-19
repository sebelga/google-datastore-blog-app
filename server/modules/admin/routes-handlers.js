"use strict";

const path = require("path");
const is = require("is");
const gstore = require("gstore-node")();

const { blogPostDomain } = require("../blog");
const { pageNotFound } = require("../exceptions/routes");
const templates = path.join(__dirname, "views");

const dashboard = async (req, res) => {
    const template = path.join(templates, "dashboard");

    let posts;
    try {
        posts = await blogPostDomain.getPosts({
            cache: req.query.cache !== "false"
        });
    } catch (error) {
        return res.render(template, {
            error,
            pageId: "admin-index"
        });
    }

    res.render(template, {
        posts: posts.entities,
        pageId: "admin-index"
    });
};

const createPost = async (req, res) => {
    const template = path.join(templates, "edit");
    const dataloader = gstore.createDataLoader();

    if (req.method === "POST") {
        const entityData = Object.assign({}, req.body, { file: req.file });

        try {
            await blogPostDomain.createPost(entityData, dataloader);
        } catch (err) {
            return res.render(template, {
                blogPost: entityData,
                action: "create",
                error: is.object(err.message) ? err.message : err
            });
        }

        return res.redirect("/admin?cache=false");
    }

    return res.render(template, {
        action: "create",
        pageId: "blogpost-edit"
    });
};

const editPost = async (req, res) => {
    const template = path.join(templates, "edit");
    const dataloader = gstore.createDataLoader();
    const { id } = req.params;

    if (req.method === "POST") {
        const entityData = Object.assign({}, req.body, { file: req.file });

        try {
            await blogPostDomain.updatePost(id, entityData, dataloader, true);
        } catch (err) {
            return res.render(template, {
                blogPost: entityData,
                action: "update",
                error: is.object(err.message) ? err.message : err
            });
        }

        return res.redirect("/admin?cache=false");
    }

    let post;
    try {
        post = await blogPostDomain.getPost(id, dataloader);
    } catch (err) {
        return res.render(template, {
            action: "update",
            error: is.object(err.message) ? err.message : err
        });
    }

    if (!post) {
        return pageNotFound(res);
    }

    res.render(template, {
        post,
        action: "update",
        pageId: "blogpost-edit"
    });
};

module.exports = {
    dashboard,
    createPost,
    editPost
};