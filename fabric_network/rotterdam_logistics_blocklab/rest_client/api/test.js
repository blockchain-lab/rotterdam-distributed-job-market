const router = require('express').Router();

const TestService = require('../test/TestService');

router.get('/runTest', (req, res, next) => {
	res = new TestService().runTest();
});

router.get('/initNetwork', (req, res, next) => {
	new TestService().initNetwork()
		.then(() => res.send("Completed"))
		.catch(next);
});

module.exports = router;