const router = require('express').Router();

const TruckerService = require('../service/TruckerService');
const ContainerDeliveryJobService = require('../service/ContainerDeliveryJobService');
const ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');

router.get("/:truckerId", (req, res, next) => {
	const truckerId = req.params.truckerId;

	new TruckerService().getTrucker(truckerId)
		.then((result) => res.json(result))
		.catch(next);
});

router.get('/bids/:truckerId', (req, res, next) => {
	const truckerId = req.params.truckerId;

	new TruckerService().getTruckerBids(truckerId)
		.then((truckerBids) => res.json(truckerBids))
		.catch(next);
});

router.get('/rating/:truckerId', (req, res, next) => {
	const truckerId = req.params.truckerId;

	new TruckerService().getRating(truckerId)
		.then((truckerRating) => res.json(truckerRating))
		.catch(next);
});

router.post('/preferences', (req, res, next) => {
	let truckerId = req.body.truckerId;
	let truckCapacity = req.body.truckCapacity;
	let availableFrom = req.body.availableFrom;
	let availableTo = req.body.availableTo;
	let allowedDestinations = req.body.allowedDestinations;

	new TruckerService()
		.updateTruckerPreferences(truckerId, truckCapacity, availableFrom, availableTo, allowedDestinations)
		.then((result) => res.json(result))
		.catch(next);
});

router.get('/contractedJobs/:truckerId', (req, res, next) => {
	const truckerId = req.params.truckerId;

	new ContainerDeliveryJobService()
		.retrieveContractedByTruckerId(truckerId)
		.then((results) => res.json(results))
		.catch(next);
});

router.post('/acceptDelivery/:containerDeliveryJobId/:password', (req, res, next) => {
	const containerDeliveryJobId = req.params.containerDeliveryJobId;
	const arrivalPassword = req.params.password;

	new ContainerDeliveryJobService()
		.acceptDelivery(containerDeliveryJobId, arrivalPassword)
		.then(() => res.status(200).send("delivery accepted"))
		.catch(next);
});

// todo: send bid as body, prevents resending of bid by accident (from broweser history, page reload etc)
router.post("/:containerDeliveryJobOfferId/submitBid/:bidderId/:bidAmount", (req, res, next) => {
	const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
	const bidderId = req.params.bidderId;
	const bidAmount = req.params.bidAmount;

	new ContainerDeliveryJobOfferService()
		.submitBid(containerDeliveryJobOfferId, bidderId, bidAmount)
		.then((result) => res.status(200).send("tx submitted successfully")) // TODO: proper status, maybe return the DeliveryJob
		.catch(next);
});

module.exports = router;