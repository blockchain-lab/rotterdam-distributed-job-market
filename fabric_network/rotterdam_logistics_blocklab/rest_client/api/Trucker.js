const router = require('express').Router();

var truckerService = require('../service/TruckerService');

router.get('/preferences/:truckerId', (req, res) => {
	truckerService.getTruckerPreferences(req.params.truckerId)
		.then((truckerPrefs) => {
			res.json(truckerPrefs);
		});
});

module.exports = router;