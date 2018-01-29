const router = require('express').Router();

const ContainerGuyService = require('../service/ContainerGuyService');
const ContainerDeliveryJobService = require('../service/ContainerDeliveryJobService');
const ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');

const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');

router.get('/allContainerDeliveryJobOffersOf/:containerGuyId', (req, res) => {
	const containerGuyId = req.params.containerGuyId;
	new ContainerGuyService().retrieveAllContainerDeliveryJobOffersByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets));
});

router.get('/allContainersOf/:containerGuyId', (req, res) => {
	const containerGuyId = req.params.containerGuyId;
	new ContainerGuyService().retrieveAllContainerInfoByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets));
});

/* TODO: simplify name and move to ContainerDeliveryJobOffer */
router.post('/createContainerDeliveryJobOffer', (req, res) => {

	new ContainerDeliveryJobOfferService()
		.createContainerDeliveryJobOffer(req.body)
		.then((result) => res.json(result))
		.catch(() => res.status(500).send("unsuccessful"));
});

router.post('/createContainerInfo', (req, res) => {

	new ContainerDeliveryJobOfferService()
		.createContainerDeliveryJobOffer(req.body)
		.then((result) => res.json(result))
		.catch(() => res.status(500).send("unsuccessful"));
});

router.post('/acceptDelivery/:containerDeliveryJobId', (req, res) => {
	const containerDeliveryJobId = req.params.containerDeliveryJobId;

	new ContainerDeliveryJobService()
		.acceptDelivery(containerDeliveryJobId)
		.then(() => res.status(200).send("delivery accepted"))
		.catch(() => res.status(501).send("error accepting delivery"));
});

module.exports = router;