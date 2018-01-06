var express = require('express'),
  	path = require('path'),
  	// WebSocket = require('ws'),
  	http = require('http'),
  	url = require('url'),
	config = require('config');

var app = express();
var server = http.createServer(app);

// start server on the specified port
server.listen(appEnv.port, function () {
  'use strict';
  // print a message when the server starts listening
  console.log('server starting on ' + appEnv.url);
});