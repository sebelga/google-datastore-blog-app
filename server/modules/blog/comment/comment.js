"use strict";

const moment = require("moment");
const Comment = require("./comment.model");

const list = (req, res) => {
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

    query.run().then(
        result => {
            result.entities = result.entities.map(comment => ({
                ...comment,
                createdOnAgo: moment(comment.createdOn).fromNow()
            }));
            res.json(result);
        },
        err => {
            res.status(400).json(err);
        }
    );
};

const create = (req, res) => {
    const entityData = Comment.sanitize(req.body);
    const comment = new Comment(entityData);

    comment.save().then(
        entity => {
            // We add an extra prop to our entityData
            entity.entityData.createdOnAgo = moment(
                comment.createdOn
            ).fromNow();

            res.json(entity.plain());
        },
        err => res.status(400).json(err)
    );
};

const deleteComment = (req, res) => {
    Comment.delete(req.params.id).then(
        () => res.send("ok"),
        err => res.status(400).json(err)
    );
};

module.exports = {
    list,
    create,
    deleteComment
};
