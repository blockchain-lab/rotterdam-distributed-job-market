const router = require('express').Router();


const ContainerGuyService = require('../service/ContainerGuyService');
const ContainerInfoService = require('../service/ContainerInfoService');
const ContainerDeliveryJobService = require('../service/ContainerDeliveryJobService');
const ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');

const ContainerInfo = require('../domain/ContainerInfo');

router.get('/allContainerDeliveryJobOffersOf/:containerGuyId', (req, res, next) => {
	const containerGuyId = req.params.containerGuyId;

	new ContainerGuyService().retrieveAllContainerDeliveryJobOffersByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets))
		.catch(next);
});

router.get('/allContainersOf/:containerGuyId', (req, res, next) => {
	const containerGuyId = req.params.containerGuyId;
	new ContainerGuyService().retrieveAllContainerInfoByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets))
		.catch(next);
});

/* TODO: simplify name and move to ContainerDeliveryJobOffer */
router.post('/createContainerDeliveryJobOffer', (req, res, next) => {

	new ContainerDeliveryJobOfferService()
		.createContainerDeliveryJobOffer(req.body)
		.then((result) => res.status(200).send("created"))
		.catch(next);
});

router.post('/createContainerInfo', (req, res, next) => {
	const containerInfo = new ContainerInfo(req.body);

	new ContainerInfoService()
		.createContainerInfo(containerInfo)
		.then((result) => res.status(200).send("created"))
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