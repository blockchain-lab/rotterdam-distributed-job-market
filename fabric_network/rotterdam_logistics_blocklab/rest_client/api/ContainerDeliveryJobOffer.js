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

router.get('/containerDeliveryJobOffersForTrucker/:truckerId', (req, res, next) => {
	const truckerId = req.params.truckerId;

	new ContainerDeliveryJobOfferService()
		.getContainerDeliveryJobOffersAvailableForTrucker(truckerId)
		.then((result) => res.json(result))
		.catch(next);
});

module.exports = router;