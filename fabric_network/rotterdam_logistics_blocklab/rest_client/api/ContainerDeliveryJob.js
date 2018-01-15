'use strict';

const router = require('express').Router();

const ContainerDeliveryJobService = require('../service/ContainerDeliveryJobService');

router.get('/:containerDeliveryJobId', (req, res) => {
	const containerDeliveryJobId = req.params.containerDeliveryJobId;

	new ContainerDeliveryJobService()
		.retrieveById(containerDeliveryJobId)
		.then((result) => {
			delete result.password;
			return result;
		})
		.then((result) => res.json(result));
});

router.post('/:containerDeliveryJobId/raiseException/:details', (req, res) => {
	const containerDeliveryJobId = req.params.containerDeliveryJobId;
	const details = req.params.details;
	new ContainerDeliveryJobService()
		.raiseException(containerDeliveryJobId, details)
		.then((result) => res.json(result));
});

module.exports = router;