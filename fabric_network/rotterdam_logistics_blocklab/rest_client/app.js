const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const url = require('url');
const config = require('config');

const ErrorTranslator = require('./errors/ErrorTranslator');
const errorTranslator = new ErrorTranslator();

var app = express();
app.use(bodyParser.json());

require('./routes')(app);

// start server on the specified port
const port = 8081;
app.listen(port, () => {
	'use strict';
	console.log('server starting on ' + port);
});

app.use((error, req, res, next) => {
	const translatedError = errorTranslator.translate(error);

	console.error(translatedError);
	res.status(500).json({error: translatedError.message});
});