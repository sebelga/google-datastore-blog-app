'use strict';

const gstore = require('gstore-node')();

const schema = new gstore.Schema({
    // key_value ??
    blogPost: { type: 'integer' },
    createdOn: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
    author: { type: 'string' },
    comment: { type: 'string', excludeFromIndexes: true },
});

module.exports = gstore.model('Comment', schema);
