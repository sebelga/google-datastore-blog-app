"use strict";

const moment = require("moment");
const Comment = require("./comment.model");

const list = async (req, res) => {
    const query = Comment.query()
        .filter("blogPost", +req.params.id)
        .order("createdOn", { descending: true })
        .limit(3);

    /**
     * If we have a page cursor, we add it to our query
     */
    if (req.query.start) {
        query.start(decodeURIComponent(req.query.start));
    }

    let result;
    try {
        result = await query.run({ format: 'ENTITY' });
    } catch(err) {
        return res.status(400).json(err);
    }

    result.entities = result.entities.map(comment => comment.plain({ virtuals: true }));

    res.json(result);
};

const create = async (req, res) => {
    const entityData = Comment.sanitize(req.body);
    const comment = new Comment(entityData);

    let entity;
    try {
        entity = await comment.save();
    } catch(err) {
        return res.status(400).json(err);
    }

    res.json(entity.plain({ virtuals: true }));
};

const deleteComment = async (req, res) => {
    try {
        await Comment.delete(req.params.id);
    } catch(err) {
        return res.status(400).json(err);
    }

    res.send("ok");
};

module.exports = {
    list,
    create,
    deleteComment
};
