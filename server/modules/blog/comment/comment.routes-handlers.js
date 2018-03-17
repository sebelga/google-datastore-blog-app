"use strict";

const moment = require("moment");
const commentDomain = require("./comment.domain");

const getComments = async (req, res) => {
    const postId = req.params.id;
    let result;
    try {
        result = await commentDomain.getComments(postId, {
            start: req.query.start,
            limit: 3,
            withVirtuals: true
        });
    } catch (err) {
        return res.status(400).json(err);
    }

    res.json(result);
};

const createComment = async (req, res) => {
    const postId = req.params.id;
    let comment;
    try {
        comment = await commentDomain.createComment(postId, req.body);
    } catch (err) {
        return res.status(400).json(err);
    }

    res.json(comment);
};

const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    let result;
    try {
        result = await commentDomain.deleteComment(commentId);
    } catch (err) {
        return res.status(400).json(err);
    }

    res.send(result);
};

module.exports = {
    getComments,
    createComment,
    deleteComment
};
