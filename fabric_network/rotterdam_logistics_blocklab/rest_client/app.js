var express = require('express'),
  	path = require('path'),
  	// WebSocket = require('ws'),
  	// http = require('http'),
  	url = require('url'),
	config = require('config');

var app = express();

require('./routes')(app);

// start server on the specified port
const port = 8081;
app.listen(port, () => {
	'use strict';
	console.log('server starting on ' + port);
});