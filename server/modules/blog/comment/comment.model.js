"use strict";

const gstore = require("gstore-node")();
const Joi = require('joi');
const moment = require("moment");

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

// We add a virtual property "createdOnFormatted" (not persisted in the Datastore)
// to display the date of the comment in our View
schema.virtual('createdOnFormatted').get(function getCreatedOnFormatted() {
    return moment(this.createdOn).fromNow();
});

module.exports = gstore.model("Comment", schema);
