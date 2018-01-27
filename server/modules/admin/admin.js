"use strict";

const path = require("path");
const is = require("is");
const logger = require("winston");
const gstore = require("gstore-node")();

const { BlogPost } = require("../blog");
const { pageNotFound } = require('../exceptions/exceptions');

const dashboard = (req, res) => {
    const view = path.join(__dirname, "views/dashboard");

    BlogPost.list()
        .then(response =>
            res.render(view, {
                blogPosts: response.entities,
                pageId: "admin-index"
            })
        )
        .catch((error) =>
            res.render(view, {
                error,
                pageId: "admin-index"
            })
        );
};

const newPost = (req, res) => {
    const view = path.join(__dirname, "views/edit");

    if (req.method === "POST") {
        const entityData = Object.assign({}, req.body, { file: req.file });

        /**
         * We create the post under a parent entity kind "Blog" with name "my-blog"
         * It doesn't matter if this entity exists, we can still create its child.
         * This will gives us strong consistency for the blog posts we create/edit/delete
         */
        const blogPost = new BlogPost(entityData, null, ["Blog", "my-blog"]);

        // We the request DataLoader instance to our entity
        // so it is available in our "pre" Hooks
        blogPost.dataloader = req.dataloader;

        return blogPost.save().then(
            entity => {
                res.redirect("/admin");
            },
            err => {
                res.render(view, {
                    blogPost: blogPost.plain(),
                    action: "create",
                    error: is.object(err.message) ? err.message : err
                });
            }
        );
    }

    return res.render(view, {
        blogPost: {},
        action: "create",
        pageId: "blogpost-edit"
    });
};

const editPost = (req, res) => {
    const { dataloader } = req;
    const view = path.join(__dirname, "views/edit");
    const id = +req.params.id;

    if (isNaN(id)) {
        return pageNotFound(res);
    }

    if (req.method === "POST") {
        const entityData = Object.assign({}, req.body, { file: req.file });

        const blogPost = new BlogPost(entityData, id, ["Blog", "my-blog"]);
        blogPost.dataloader = req.dataloader;

        return blogPost.save()
            .then(entity => {
                if (req.headers["content-type"] === "application/json") {
                    res.json(entity.plain());
                } else {
                    res.redirect("/admin");
                }
            })
            .catch(err =>
                res.render(view, {
                    blogPost: blogPostData,
                    action: "update",
                    error: is.object(err.message) ? err.message : err
                })
            );
    }

    return dataloader
        .load(BlogPost.key(id, ["Blog", "my-blog"]))
        .then(blogPost => {
            if (!blogPost) {
                return pageNotFound(res);
            }

            // The entity "key" is inside a Symbol on the entityData
            // we can access it with "gstore.ds.KEY"
            // We then add the id to the entityData
            blogPost.id = +blogPost[gstore.ds.KEY].id;

            res.render(view, {
                blogPost,
                action: "update",
                pageId: "blogpost-edit"
            });
        })
        .catch(err =>
            res.render(view, {
                action: "update",
                error: is.object(err.message) ? err.message : err
            })
        );
};

module.exports = {
    dashboard,
    newPost,
    editPost
};
