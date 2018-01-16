'use strict';

const is     = require('is');
const async  = require('async');
const marked = require('marked');
const moment = require('moment');

const BlogPost      = require('../models/blog-post.model');
const Comment       = require('../models/comment.model');
const imagesHelpers = require('../helpers/images');
const stringHelpers = require('../helpers/string');

function list(req, res) {
    BlogPost.list((err, result) => {
        if (err) {
            return res.render('index', { blogPosts:null, error : {message : 'Could not load posts'}});
        }
        res.render('index', { blogPosts: result.entities, pageId:'home'});
    });
}

function get(req, res) {
    async.parallel([getBlogPost, getComments], onData);

    //////////

    function getBlogPost(cb) {
        BlogPost.get(req.params.id, (err, entity) => {
            if (err) {
                return cb(err);
            }
            let blogPost = entity.plain();

            // Convert markdown to Html
            if (blogPost.content) {
                blogPost.contentHtml = marked(blogPost.content);
            }
            return cb(null, blogPost);
        });
    }

    function getComments(cb) {
        Comment.query()
                .filter('blogPost', parseInt(req.params.id))
                .order('createdOn', {descending:true})
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
            pageId:'blogpost-view',
            blogPost: blogPost,
            comments: comments
        });
    }
}

function create(req, res) {
    if ('POST' === req.method) {
        let data     = BlogPost.sanitize(req.body);
        data.excerpt = createExcerpt(data.content);

        let blogPost = new BlogPost(data);

        blogPost.save((err, entity) => {
            if (err) {
                return res.render('admin/edit', {
                    blogPost : data,
                    action : 'create',
                    error : is.object(err.message) ? err.message : err
                })
            }
            console.log('*** New Blog Post created');
            console.log('------------------');
            console.log(entity.plain());
            console.log('------------------');
            res.redirect('/admin');
        });
    } else {
        res.render('admin/edit', {
            blogPost : {},
            action: 'create',
            pageId:'blogpost-edit'
        });
    }
}

function edit(req, res) {
    if ('POST' === req.method) {
        let data = BlogPost.sanitize(req.body);
        data.excerpt = createExcerpt(data.content);

        BlogPost.update(req.params.id, data, (err, entity) => {
            if (req.query.format && 'json' === req.query.format) {
                res.json({
                    status:200
                });
            } else {
                res.redirect('/admin');
            }
        });
    } else {

        BlogPost.get(req.params.id, (err, entity) => {
            let blogPost = entity.plain();
            res.render('admin/edit', {
                blogPost: blogPost,
                action: 'update',
                pageId:'blogpost-edit'
            });
        });
    }
}

function _delete(req, res) {
    var post = BlogPost.get(req.params.id, (err, entity) => {
        if (err) {
            return res.json(err);
        }

        if (entity.get('imageData')) {
            // Delete image in bucket...
            imagesHelpers.deleteFromGCS(entity.get('imageData').storageObjects, (err, apiResponse) => {
                if (err) {
                    return res.json({
                        status: 400,
                        message : 'Could not delete images from bucket'
                    });
                }

                process();
            });
        } else {
            process();
        }

        function process() {
            BlogPost.delete(req.params.id, (err, result) => {

            if (err) {
                return res.json(err);
            }

            res.json({
                status  : 200,
                success : true
            });
        });
        }
    });
}

// Private
// -------

function createExcerpt(content) {
    if (typeof content === 'undefined' || content === null) {
        return null;
    }

    let excerpt = stringHelpers.limitChars(content, 300);
    excerpt     = stringHelpers.removeMarkdown(excerpt);
    return excerpt;
}

module.exports = {
    list   : list,
    get    : get,
    create : create,
    edit   : edit,
    delete : _delete
};