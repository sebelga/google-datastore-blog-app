const { BlogPost, blogPostCtrl, helpers: blogPostHelpers } = require('./blog-post');
const { Comment, commentCtrl } = require('./comment');

module.exports = {
    BlogPost,
    blogPostCtrl,
    blogPostHelpers,
    Comment,
    commentCtrl,
};
