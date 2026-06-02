require("dotenv").config()

var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');

const authRoutes = require("./routes/authRoutes")
const customerRoutes = require("./routes/customerRoutes")

var app = express();

app.use(logger('dev'));
app.use(express.json())

app.use("/api", authRoutes)
app.use("/api/customers", customerRoutes)

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ message: err.message });
});

module.exports = app;
