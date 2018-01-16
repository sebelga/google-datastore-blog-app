'use strict';

const moment  = require('moment');
const Comment = require('../models/comment.model');

function list(req, res) {
    var query = Comment.query()
            .filter('blogPost', parseInt(req.params.id))
                .order('createdOn', {descending:true})
                .limit(3);

    if (req.query.start) {
        query.start(req.query.start);
    }

    query.run(function(err, result) {
        if (err) {
            return res.json(err);
        }
        result.entities.forEach((comment) => {
            comment.createdOnAgo = moment(comment.createdOn).fromNow();
        });
        res.json(result);
    });

}

function create(req, res) {
    let data = Comment.sanitize(req.body);
    data.createdOn = new Date();

    let comment = new Comment(data);

    comment.save((err, entity) => {
        if (err) {
            return res.status(400).send('Error saving comment');
        }
        console.log('*** New Comment created');
        console.log('------------------');
        console.log(entity.plain());
        console.log('------------------');
        let comment = entity.plain();
        comment.createdOnAgo = moment(comment.createdOn).fromNow();
        res.json({
            status:200,
            comment : comment
        });
    });

}

function _delete(req, res) {
    Comment.delete(req.params.id, (err, response) => {
        if (err) {
            // TODO
            return res(err);
        }

        res.json({
            status : 200
        });
    });
}


module.exports = {
    list:    list,
    create : create,
    delete: _delete
};