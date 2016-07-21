'use strict';

const gstore = require('gstore-node')();

const Schema = gstore.Schema;

const schema = new Schema({
    // blogPost: { type: 'int' },
    createdOn: { type: 'datetime' },
    author: { type: 'string' },
    comment: { type: 'string', excludeFromIndexes: true },
});

module.exports = gstore.model('Comment', schema);
