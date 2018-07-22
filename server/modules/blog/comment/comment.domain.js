'use strict';

module.exports = (_, { db }) => {
  const getComments = (postId, options) => {
    postId = +postId;

    if (options.start) {
      options.start = decodeURIComponent(options.start);
    }

    return db.getComments(postId, options);
  };

  const createComment = (postId, data) => {
    postId = +postId;
    data.blogPost = postId;
    return db.createComment(data).then(entity => entity.plain({ virtuals: true }));
  };

  const deleteComment = id => db.deleteComment(id);

  const queryDB = db.query;

  return {
    getComments,
    createComment,
    deleteComment,
    queryDB,
  };
};
