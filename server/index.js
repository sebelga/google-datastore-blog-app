"use strict";

const express = require("express");
const path = require("path");
const addRoutes = require("./routes");

const app = express();
app.set("views", __dirname);
app.set("view engine", "pug");
app.use(
    "/public",
    express.static(path.join(__dirname, "public"), { maxAge: '1 year' })
);

// Add Routes
addRoutes(app);

module.exports = app;
