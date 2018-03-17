"use strict";

const path = require("path");
const gstore = require("gstore-node");

const handleError = (res, { template, data, error }) => {
    if (template) {
        return res.render(template, { ...data, error });
    }
    return res.status(400).json(error);
};

const pageNotFound = res => {
    res.redirect("/404");
};

module.exports = { handleError, pageNotFound };
