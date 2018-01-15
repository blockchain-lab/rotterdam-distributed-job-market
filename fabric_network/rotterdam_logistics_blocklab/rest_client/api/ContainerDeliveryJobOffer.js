'use strict';

const router = require('express').Router();

const ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');

router.get('/byId/:id', (req, res) => {
	const id = req.params.id;

	new ContainerDeliveryJobOfferService()
		.retrieveById(id)
		.then((result) => res.json(result));
});

router.post("/:containerDeliveryJobOfferId/acceptBid/:truckerBidId", (req, res) => {
	const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
	const truckerBidId = req.params.truckerBidId;

	new ContainerDeliveryJobOfferService()
		.acceptBid(containerDeliveryJobOfferId, truckerBidId)
		.then((result) => { res.status(200).send("tx submitted successfully"); } ); // TODO: proper status, maybe return the DeliveryJob
});

module.exports = router;