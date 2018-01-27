"use strict";

const path = require("path");
const marked = require("marked");
const gstore = require("gstore-node")();

const BlogPost = require("./blog-post.model");
const Comment = require("../comment/comment.model");
const { handleError, pageNotFound } = require("../../exceptions/exceptions");

const list = async (req, res) => {
    let posts;

    try {
        posts = await BlogPost.list();
    } catch (error) {
        return res.render(path.join(__dirname, "../views/index"), {
            blogPosts: [],
            error
        });
    }

    res.render(path.join(__dirname, "../views/index"), {
        blogPosts: posts.entities,
        pageId: "home"
    });
};

const get = async (req, res) => {
    const dataloader = gstore.createDataLoader();
    const id = +req.params.id;

    if (isNaN(id)) {
        return pageNotFound(res);
    }

    let result;

    try {
        /**
         * Fetch the BlogPost and its comments in parallel
         */
        result = await Promise.all([getBlogPost(), getComments()]);
    } catch (err) {
        return handleError(res, {
            template,
            error,
            data: { blogPost: null }
        });
    }

    const template = path.join(__dirname, "..", "views", "view");
    const [blogPost, comments] = result;

    if (blogPost === null) {
        return pageNotFound(res);
    }

    return res.render(template, {
        pageId: "blogpost-view",
        blogPost,
        comments
    });

    // ----------

    function getBlogPost() {
        return dataloader
            .load(BlogPost.key(id, ["Blog", "my-blog"]))
            .then(blogPost => {
                if (!blogPost) {
                    return null;
                }

                blogPost.id = id;

                if (blogPost.content) {
                    // Convert markdown to Html
                    blogPost.contentHtml = marked(blogPost.content);
                }

                return blogPost;
            });
    }

    function getComments() {
        /**
         * Query the 3 most recent comments for the current BlogPost
         */
        return Comment.query()
            .filter("blogPost", id)
            .order("createdOn", { descending: true })
            .limit(3)
            .run({ format: "ENTITY" })
            .then(result => {
                result.entities = result.entities.map(comment =>
                    comment.plain({ virtuals: true })
                );

                // We encode the pageCursor to be able to use it safely as a uri Query parameter
                result.nextPageCursor = result.nextPageCursor
                    ? encodeURIComponent(result.nextPageCursor)
                    : undefined;

                return result;
            });
    }
};

const updatePost = async (req, res) => {
    const { file } = req;
    const dataloader = gstore.createDataLoader();
    const entityData = Object.assign({}, req.body, { file });

    let entity;
    try {
        /**
         * We pass our DataLoader instance to the update method for 2 reasons
         * 1) it will be attached to the created entity and available in the "pre" hooks
         * 2) so gstore can clear the cache for the updated Key after the update is done
         */
        entity = await BlogPost.update(
            +req.params.id,
            entityData,
            ["Blog", "my-blog"],
            null,
            null,
            {
                dataloader
            }
        );
    } catch (err) {
        return res.status(500).json(err);
    }

    res.json(entity.plain());
};

const deletePost = async (req, res) => {
    const dataloader = gstore.createDataLoader();

    let result;
    try {
        result = await BlogPost.delete(
            +req.params.id,
            ["Blog", "my-blog"],
            null,
            null,
            null,
            {
                dataloader
            }
        );
    } catch (err) {
        return res.status(401).send({ error: err.message });
    }

    if (!result.success) {
        return res.status(400).json(result);
    }

    return res.json(result);
};

module.exports = {
    list,
    get,
    updatePost,
    deletePost
};
