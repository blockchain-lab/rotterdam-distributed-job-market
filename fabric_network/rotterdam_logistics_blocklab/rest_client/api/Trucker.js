const router = require('express').Router();

const TruckerService = require('../service/TruckerService');

router.get('/preferences/:truckerId', (req, res) => {
	new TruckerService().getTruckerPreferences(req.params.truckerId)
		.then((truckerPrefs) => {
			res.json(truckerPrefs);
		});
});

module.exports = router;