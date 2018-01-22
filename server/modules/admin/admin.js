"use strict";

const path = require("path");
const is = require("is");
const logger = require("winston");
const gstore = require("gstore-node")();

const { BlogPost } = require("../blog");

const dashboard = (req, res) => {
    const view = path.join(__dirname, "views/dashboard");

    BlogPost.list()
        .then(response =>
            res.render(view, {
                blogPosts: response.entities,
                pageId: "admin-index"
            })
        )
        .catch(() =>
            res.render(view, {
                error: { message: "Error loading posts." },
                pageId: "admin-index"
            })
        );
};

const newPost = (req, res) => {
    const view = path.join(__dirname, "views/edit");

    if (req.method === "POST") {
        const entityData = Object.assign({}, req.body, { file: req.file });
        const blogPost = new BlogPost(entityData);

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

    if (req.method === "POST") {
        const entityData = Object.assign({}, req.body, { file: req.file });
        const blogPost = new BlogPost(entityData, +req.params.id);
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
        .load(BlogPost.key(+req.params.id))
        .then(blogPost => {
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
