"use strict";

const path = require("path");
const marked = require("marked");
const async = require("async");
const moment = require("moment");

const BlogPost = require("./blog-post.model");
const Comment = require("../comment/comment.model");
const { handleError, pageNotFound } = require("../../exceptions/exceptions");

const list = (req, res) => {
    BlogPost.list().then(
        response =>
            res.render(path.join(__dirname, "../views/index"), {
                blogPosts: response.entities,
                pageId: "home"
            }),
        error =>
            res.render(path.join(__dirname, "../views/index"), {
                blogPosts: [],
                error
            })
    );
};

const get = (req, res) => {
    const { dataloader } = req;
    const id = +req.params.id;

    if (isNaN(id)) {
        return pageNotFound(res);
    }

    /**
     * Fetch the BlogPost and its comments in parallel
     */
    async.parallel([getBlogPost, getComments], onData);

    // ----------

    function getBlogPost(cb) {
        dataloader
            .load(BlogPost.key(id))
            .then(blogPost => {
                if (!blogPost) {
                    return cb(null, null);
                }

                blogPost.id = id;

                if (blogPost.content) {
                    // Convert markdown to Html
                    blogPost.contentHtml = marked(blogPost.content);
                }

                return cb(null, blogPost);
            })
            .catch(cb);
    }

    function getComments(cb) {
        /**
         * Query the 3 most recent comments for the current BlogPost
         */
        Comment.query()
            .filter("blogPost", +req.params.id)
            .order("createdOn", { descending: true })
            .limit(3)
            .run()
            .then(result => {
                result.entities = result.entities.map(comment =>
                    // Format the comment date before sending back
                    ({
                        ...comment,
                        createdOnFormatted: moment(comment.createdOn).fromNow()
                    })
                );
                cb(null, result);
            })
            .catch(cb);
    }

    function onData(error, results) {
        const template = path.join(__dirname, "..", "views", "view");

        if (error) {
            return handleError(res, {
                template,
                error,
                data: { blogPost: null }
            });
        }

        const [blogPost, comments] = results;

        if (blogPost === null) {
            return pageNotFound(res);
        }

        return res.render(template, {
            pageId: "blogpost-view",
            blogPost,
            comments
        });
    }
};

const updatePost = (req, res) => {
    const { dataloader, file } = req;
    const entityData = Object.assign({}, req.body, { file });

    /**
     * We pass our DataLoader instance to the update method for 2 reasons
     * 1) it will be attached to the created entity and available in the "pre" hooks
     * 2) so gstore can clear the cache for the updated Key after the update is done
     */
    return BlogPost.update(+req.params.id, entityData, null, null, null, {
        dataloader
    })
        .then(entity => {
            return res.json(entity.plain());
        })
        .catch(err => res.status(500).json(err));
};

const deletePost = (req, res) => {
    const { dataloader } = req;

    BlogPost.delete(+req.params.id, null, null, null, null, { dataloader })
        .then(response => {
            if (!response.success) {
                return res.status(400).json(response);
            }
            return res.json(response);
        })
        .catch(err => {
            res.status(401).send({ error: err.message });
        });
};

module.exports = {
    list,
    get,
    updatePost,
    deletePost
};
