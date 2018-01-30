'use strict';

const router = require('express').Router();

const ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');

router.get('/:containerDeliveryJobOfferId/getTruckerBids', (req, res, next) => {
	const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;

	new ContainerDeliveryJobOfferService()
		.retrieveTruckerBidsForContainer(containerDeliveryJobOfferId)
		.then((result) => res.json(result));
});

// TODO: remove byId path
router.get('/byId/:id', (req, res) => {
	const id = req.params.id;

	new ContainerDeliveryJobOfferService()
		.retrieveById(id)
		.then((result) => res.json(result));
});

// BACKWARDS COMPAT (remove after GUI update to use /cancelBid/)
router.post("/:containerDeliveryJobOfferId/cancelBid/:truckerBidId", (req, res, next) => {
	const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
	const truckerBidId = req.params.truckerBidId;

	new ContainerDeliveryJobOfferService()
		.cancelBid(truckerBidId)
		.then((result) => { res.status(200).send("tx submitted successfully"); } )
		.catch(next);
});

router.post("/cancelBid/:truckerBidId", (req, res, next) => {
	const truckerBidId = req.params.truckerBidId;

	new ContainerDeliveryJobOfferService()
		.cancelBid(truckerBidId)
		.then((result) => { res.status(200).send("tx submitted successfully"); } )
		.catch(next);
});

// TODO: remove containerDeliveryJobOfferId, the truckerBidId is enough to identify the jobOffer
router.post("/:containerDeliveryJobOfferId/acceptBid/:truckerBidId", (req, res, next) => {
	const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
	const truckerBidId = req.params.truckerBidId;

	new ContainerDeliveryJobOfferService()
		.acceptBid(containerDeliveryJobOfferId, truckerBidId)
		.then((result) => { res.status(200).send("tx submitted successfully"); } )
		.catch(next);
});

/**
	Query string:
		* dest 	- allowed destination (at the moment: city name)
		* from 	- datetime available from (to pickup)
		* to 	- datetime available to (to pickup)
		* adr 	- ADR level required {"YES", "NONE"}
*/
router.get('/search/?', (req, res, next) => {

	/* some quick validation */
	if (req.query.dest === undefined) {
		res.status(400).send('dest parameter not supplied');
		return;
	}

	if (req.query.from === undefined) {
		res.status(400).send('from parameter not supplied');
		return;
	}

	if (req.query.to === undefined) {
		res.status(400).send('to parameter not supplied');
		return;
	}

	if (req.query.adr === undefined) {
		res.status(400).send('adr parameter not supplied');
		return;
	}

	const allowedDestinations = req.query.dest.toString().split(",");;
	const availableFrom = req.query.from;
	const availableTo = req.query.to;
	const requiredAdrTraining = req.query.adr;
	
	console.log(
		`ContainerDeliveryJobOffers query: ` +
		`	allowedDestinations ${allowedDestinations} ` +
		`	availableFrom ${availableFrom}, ` +
		`	availableTo ${availableTo}, ` +
		`	requiredAdrTraining ${requiredAdrTraining}`
	);

	new ContainerDeliveryJobOfferService()
		.getEligableContainerDeliveryJobOffers(allowedDestinations, availableFrom, availableTo, requiredAdrTraining)
		.then((result) => res.json(result))
		.catch(next);
});

module.exports = router;