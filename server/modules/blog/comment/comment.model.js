"use strict";

const gstore = require("gstore-node")();
const Joi = require('joi');

const schema = new gstore.Schema({
    blogPost: { joi: Joi.number() },
    createdOn: {
        joi: Joi.date().default(() => new Date(), 'Current datetime of request'),
        write: false
    },
    name: { joi: Joi.string().min(3) },
    comment: { joi: Joi.string().min(10), excludeFromIndexes: true },
    website: { joi: Joi.string().uri().allow(null) }
}, { joi: true });

module.exports = gstore.model("Comment", schema);
