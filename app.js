var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var guardianRouter = require('./routes/guardian');
var nytRouter = require('./routes/nyt');
var search = require('./routes/search');
var app = express();

var cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/guardian', guardianRouter);
app.use('/nyt', nytRouter);
app.use('/search', search);

module.exports = app;
