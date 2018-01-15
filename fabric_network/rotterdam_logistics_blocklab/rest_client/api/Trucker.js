const router = require('express').Router();

const TruckerService = require('../service/TruckerService');

router.get('/preferences/:truckerId', (req, res) =>
{
	new TruckerService().getTruckerPreferences(req.params.truckerId)
		.then((truckerPrefs) => 
		{
			res.json(truckerPrefs);
		});
});

router.get('/truckerBids/:truckerId', (req, res) =>
{
	new TruckerService().getTruckerBids(req.params.truckerId)
		.then((truckerBids) =>
		{
			res.json(truckerBids);
		});
});

router.post('/updateTruckerPreferences', (req, res) =>
{
	let truckerId = req.body.truckerId;
	let truckCapacity = req.body.truckCapacity;
	let availableFrom = req.body.availableFrom;
	let availableTo = req.body.availableTo;
	let allowedDestinations = req.body.allowedDestinations;

	new TruckerService()
		.updateTruckerPreferences(truckerId, truckCapacity, availableFrom, availableTo, allowedDestinations)
		.then((result) => res.json(result))
		.catch(() => res.status(500).send("unsuccessful"));
});

module.exports = router;