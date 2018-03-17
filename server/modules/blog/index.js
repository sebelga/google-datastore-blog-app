"use strict";

const routes = require("./routes");
const { blogPostDomain } = require("./blog-post");
const { commentDomain } = require("./comment");

module.exports = {
    routes,
    blogPostDomain,
    commentDomain
};
