'use strict';

const gstore = require('gstore-node')();

const schema = new gstore.Schema({
    blogPost: { type: 'int' },
    createdOn: { type: 'datetime', default: gstore.defaultValues.NOW, write: false },
    author: { type: 'string' },
    comment: { type: 'string', excludeFromIndexes: true },
});

module.exports = gstore.model('Comment', schema);
