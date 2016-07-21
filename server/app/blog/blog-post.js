'use strict';

const path = require('path');
const marked = require('marked');

const BlogPost = require('./blog-post.model');

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
};

const create = (req, res) => {
    const view = path.join(__dirname, 'views/edit');

    if (req.method === 'POST') {
        /**
         * Posting Data
         */
        const data = BlogPost.sanitize(req.body);
        data.excerpt = createExcerpt(data.content);

        if (req.file) {
            data.posterUri = req.file.cloudStoragePublicUrl;
            data.cloudStorageObject = req.file.cloudStorageObject;
        }

        const blogPost = new BlogPost(data);

        blogPost.save()
                .then((entity) => {
                    logger.info('*** New Blog Post created');
                    logger.info('------------------');
                    logger.info(entity.plain());
                    logger.info('------------------');
                    res.redirect('/admin');
                })
                .catch(err => (
                    res.render(view, {
                        blogPost: data,
                        action: 'create',
                        error: is.object(err.message) ? err.message : err,
                    })
                ));
    } else {
        /**
         * Getting the View
         */
        res.render(view, {
            blogPost: {},
            action: 'create',
            pageId: 'blogpost-edit',
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

module.exports = {
    list,
    get,
    create,
    deletePost,
};
