'use strict';

var gstore = require('gstore-node')();
var Schema = gstore.Schema;

var schema = new Schema({
    blogPost:  {type:'int'},
    createdOn: {type: 'datetime'},
    author:    {type: 'string'},
    comment:   {type: 'string', excludeFromIndexes:true}
});

module.exports = gstore.model('Comment', schema);