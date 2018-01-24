var express = require('express'),
  	path = require('path'),
  	bodyParser = require('body-parser'),
  	url = require('url'),
	config = require('config');
const fileUpload = require('express-fileupload');
var cors = require('cors');

var app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors({
    //origin: ['<DOMAIN1>', '<DOMAIN2>', ...],
  	credentials: true
}));


require('./routes')(app);

// start server on the specified port
const port = 8081;
app.listen(port, () => {
	'use strict';
	console.log('server starting on ' + port);
});