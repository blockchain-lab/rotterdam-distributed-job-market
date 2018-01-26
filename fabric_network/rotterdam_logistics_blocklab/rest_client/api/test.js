const router = require('express').Router();

const TestService = require('../test/TestService');

router.get('/runTest', (req, res) => {
	res = new TestService().runTest();
});

router.get('/initNetwork', (req, res) => {
	new TestService().initNetwork()
		.then(() => res.send("Completed"))
		.catch((error) => res.status(501).json({error: error.message}));
});

module.exports = router;