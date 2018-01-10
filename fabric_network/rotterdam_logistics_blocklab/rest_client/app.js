var express = require('express'),
  	path = require('path'),
  	bodyParser = require('body-parser'),
  	url = require('url'),
	config = require('config');

var app = express();
app.use(bodyParser.json());

require('./routes')(app);

// start server on the specified port
const port = 8081;
app.listen(port, () => {
	'use strict';
	console.log('server starting on ' + port);
});