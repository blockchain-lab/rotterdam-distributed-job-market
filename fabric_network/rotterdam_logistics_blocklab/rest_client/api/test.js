const router = require('express').Router();

const TestService = require('../test/TestService');

router.get('/runTest', (req, res) => {
	res = new TestService().runTest();
});

router.get('/initNetwork', (req, res) => {
	new TestService().initNetwork();
	res.json("Completed");
});

module.exports = router;