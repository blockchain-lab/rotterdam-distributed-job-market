const router = require('express').Router();

const ContainerGuyService = require('../service/ContainerGuyService');
const ContainerDeliveryJobService = require('../service/ContainerDeliveryJobService');
const ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');

const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');

router.get('/allContainersOf/:containerGuyId', (req, res, next) => {
	const containerGuyId = req.params.containerGuyId;
	
	console.log("allContainersOf containerGuyId: " + containerGuyId);

	new ContainerGuyService().retrieveAllContainerDeliveryJobOffersByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets))
		.catch(next);
});

/* TODO: simplify name and move to ContainerDeliveryJobOffer */
router.post('/createContainerDeliveryJobOffer', (req, res, next) => {

	new ContainerDeliveryJobOfferService()
		.createContainerDeliveryJobOffer(req.body)
		.then((result) => res.json(result))
		.catch(next);
});

router.post('/createContainerInfo', (req, res, next) => {

	new ContainerDeliveryJobOfferService()
		.createContainerDeliveryJobOffer(req.body)
		.then((result) => res.json(result))
		.catch(next);
});

router.post('/acceptDelivery/:containerDeliveryJobId', (req, res, next) => {
	const containerDeliveryJobId = req.params.containerDeliveryJobId;

	new ContainerDeliveryJobService()
		.acceptDelivery(containerDeliveryJobId)
		.then(() => res.status(200).send("delivery accepted"))
		.catch(next);
});

module.exports = router;