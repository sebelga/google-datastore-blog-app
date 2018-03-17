"use strict";

const DB = require("./comment.db");

const getComments = (postId, options) => {
    postId = +postId;

    if (options.start) {
        options.start = decodeURIComponent(options.start);
    }

    return DB.getComments(postId, options);
};

const createComment = (postId, data) => {
    postId = +postId;
    data.blogPost = postId;
    return DB.createComment(data).then(entity =>
        entity.plain({ virtuals: true })
    );
};

const deleteComment = id => DB.deleteComment(id);

module.exports = {
    getComments,
    createComment,
    deleteComment
};
