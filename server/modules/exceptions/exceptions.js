"use strict";

const path = require("path");
const gstore = require("gstore-node");

const handleError = (error, res, view) => {
    if (view) {
        return res.render(view.template, { ...view, error });
    }
    return res.status(400).json(error);
};

const pageNotFound = res => {
    res.status(404).render(path.join(__dirname, "../..", "views", "404"));
};

module.exports = { handleError, pageNotFound };
