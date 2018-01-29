'use strict';

const router = require('express').Router();

const ContainerDeliveryJobService = require('../service/ContainerDeliveryJobService');

router.get('/:containerDeliveryJobId', (req, res, next) => {
	const containerDeliveryJobId = req.params.containerDeliveryJobId;

	new ContainerDeliveryJobService()
		.retrieveById(containerDeliveryJobId)
		.then((result) => {
			// hacky, todo: move to using Domain/Model and Domain/
			delete result.password;
			return result;
		})
		.then((result) => res.json(result))
		.catch(next);
});

router.post('/:containerDeliveryJobId/raiseException/:details', (req, res, next) => {
	const containerDeliveryJobId = req.params.containerDeliveryJobId;
	const details = req.params.details;
	
	new ContainerDeliveryJobService()
		.raiseException(containerDeliveryJobId, details)
		.then((result) => res.json(result))
		.catch(next);
});

module.exports = router;