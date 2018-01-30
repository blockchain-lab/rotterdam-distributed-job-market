const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const url = require('url');
const cors = require('cors');
const config = require('config');
const fileUpload = require('express-fileupload');

const ErrorTranslator = require('./errors/ErrorTranslator');
const errorTranslator = new ErrorTranslator();

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

app.use((error, req, res, next) => {
	const translatedError = errorTranslator.translate(error);

	console.error(translatedError);
	res.status(500).json({error: translatedError.message});
});