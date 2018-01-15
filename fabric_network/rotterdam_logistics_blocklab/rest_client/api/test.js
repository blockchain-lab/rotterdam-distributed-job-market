const router = require('express').Router();

const TestService = require('../test/TestService');

router.get('/runTest', (req, res) => {
	new TestService().runTest()
		.then((result) => {
			res.json("testString");
		});
});

router.get('/initNetwork', (req, res) => {
	new TestService().initNetwork();
	res.json("Completed");
});

module.exports = router;