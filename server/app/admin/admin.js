'use strict';

const path = require('path');
const is = require('is');
const logger = require('winston');

const stringHelpers = require('../helpers/string');
const BlogPost = require('../blog/blog-post.model');

const dashboard = (req, res) => {
    const view = path.join(__dirname, 'views/dashboard');

    BlogPost.list()
            .then(response => res.render(view, { blogPosts: response.entities, pageId: 'admin-index' }))
            .catch(() => res.render(view, { error: { message: 'Could not load posts' }, pageId: 'admin-index' }));
};

function editPost(req, res) {
    const view = path.join(__dirname, 'views/edit');

    if (req.method === 'POST') {
        const blogPostData = BlogPost.sanitize(req.body);
        blogPostData.excerpt = createExcerpt(blogPostData.content);

        /**
         * We update the post passing options parameters with "replace" set to true
         * Be default, the Model.update() method does a "PATCH" operation.
         * It fetches the entity, then merge the Datastore data and then save the merged object back
         * By setting "replace" to true, we are skipping the fetching + merging and saving directly to the Datastore
         */
        return BlogPost.update(+req.params.id, blogPostData, null, null, null, { replace: true })
                .then((entity) => {
                    if (req.headers['content-type'] === 'application/json') {
                        res.json(entity.plain());
                    } else {
                        res.redirect('/admin');
                    }
                })
                .catch(err => (
                    res.render(view, {
                        blogPost: blogPostData,
                        action: 'update',
                        error: is.object(err.message) ? err.message : err,
                    })
                ));
    }

    return BlogPost.get(+req.params.id)
            .then((entity) => {
                const blogPost = entity.plain();
                res.render(view, {
                    blogPost,
                    action: 'update',
                    pageId: 'blogpost-edit',
                });
            })
            .catch(err => (
                res.render(view, {
                    action: 'update',
                    error: is.object(err.message) ? err.message : err,
                })
            ));
}

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
    dashboard,
    editPost,
};
