"use strict";

const path = require("path");
const marked = require("marked");
const async = require("async");
const moment  = require('moment');

const BlogPost = require("./blog-post.model");
const Comment = require("../comment/comment.model");
const helpers = require("./blog-post.helpers");

const list = (req, res) => {
    BlogPost.list()
        .then(response =>
            res.render(path.join(__dirname, "../views/index"), {
                blogPosts: response.entities,
                pageId: "home"
            })
        )
        .catch(err =>
            res.render(path.join(__dirname, "../views/index"), {
                blogPosts: [],
                error: { message: err }
            })
        );
};

const get = (req, res) => {
    const { dataloader } = req;

    /**
     * Fetch the BlogPost and its comments in parallel
     */
    async.parallel([getBlogPost, getComments], onData);

    // ----------

    function getBlogPost(cb) {
        dataloader
            .load(BlogPost.key(+req.params.id))
            .then(blogPost => {
                blogPost.id = +req.params.id;

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
                        createdOnFormatted: moment(comment.createdOn).format('lll')
                    })
                );
                cb(null, result);
            })
            .catch(cb);
    }

    function onData(err, results) {
        if (err) {
            return res.status(400).send(err.message);
        }

        const [blogPost, comments] = results;

        return res.render(path.join(__dirname, "../views/view"), {
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
     * We pass our DataLoader instance to the update method
     * so it is attached to the created entity and available in the "pre" hooks
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
    BlogPost.delete(+req.params.id)
        .then(response => {
            if (!response.success) {
                return res.status(400).json(response);
            }
            return res.json(response);
        })
        .catch(err => res.status(500).json(err));
};

module.exports = {
    list,
    get,
    updatePost,
    deletePost
};
