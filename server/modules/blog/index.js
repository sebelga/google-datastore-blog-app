'use strict';

const Routes = require('./routes');
const BlogPost = require('./blog-post');
const Comment = require('./comment');

module.exports = (context, { images }) => {
  const comment = Comment(context);
  const blogPost = BlogPost(context, { comment, images });
  const { webRoutes, apiRoutes } = Routes(context, { blogPost, comment });

  return {
    webRoutes,
    apiRoutes,
    blogPost,
    comment,
  };
};
