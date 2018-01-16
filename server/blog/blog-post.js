'use strict';

const path = require('path');
const marked = require('marked');

const BlogPost = require('./blog-post.model');
const stringHelpers = require('../helpers/string');

const list = (req, res) => {
    BlogPost.list()
        .then(response => res.render(path.join(__dirname, 'views/index'), { blogPosts: response.entities, pageId: 'home' }))
        .catch((err) => res.render(path.join(__dirname, 'views/index'), { blogPosts: [], error: { message: err } }));
};

const get = (req, res) => {
    BlogPost.get(+req.params.id)
        .then((entity) => {
            const blogPost = entity.plain();

            // Convert markdown to Html
            if (blogPost.content) {
                blogPost.contentHtml = marked(blogPost.content);
            }

            return res.render(path.join(__dirname, 'views/view'), {
                pageId: 'blogpost-view',
                blogPost,
                comments: { entities: [] },
            });
        }).catch(err => res.status(err.status).send(err.message));

    // async.parallel([getBlogPost, getComments], onData);

    // ----------

    function getComments(cb) {
        Comment.query()
            .filter('blogPost', parseInt(req.params.id))
            .order('createdOn', { descending: true })
            .limit(3)
            .run((err, result) => {
                if (err) {
                    return cb(err);
                }
                result.entities.forEach((comment) => {
                    comment.createdOnFormatted = moment(comment.createdOn).fromNow();
                });
                cb(null, result);
            });
    }

    function onData(err, results) {
        let blogPost;
        let comments;

        if (err) {
            return res.status(err.status).send(err.message);
        }

        blogPost = results[0];
        comments = results[1];

        res.render('view', {
            pageId: 'blogpost-view',
            blogPost: blogPost,
            comments: comments
        });
    }
};

const deletePost = (req, res) => {
    BlogPost.delete(+req.params.id)
        .then((response) => {
            if (!response.success) {
                return res.status(400).json(response);
            }
            return res.json(response);
        });
};

// -------private

function createExcerpt(content) {
    if (typeof content === 'undefined' || content === null) {
        return null;
    }

    let excerpt = stringHelpers.limitChars(content, 300);
    excerpt = stringHelpers.removeMarkdown(excerpt);
    return excerpt;
}

module.exports = {
    list,
    get,
    deletePost,
};
