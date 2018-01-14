const router = require('express').Router();

const ContainerGuyService = require('../service/ContainerGuyService');
const ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');

const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');

router.get('/allContainersOf/:containerGuyId', (req, res) => {
	const containerGuyId = req.params.containerGuyId;
	
	console.log("allContainersOf containerGuyId: " + containerGuyId);

	new ContainerGuyService().retrieveAllContainerDeliveryJobOffersByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets));
});

/* TODO: simplify name and move to ContainerDeliveryJobOffer */
router.post('/createContainerDeliveryJobOffer', (req, res) => {

	new ContainerDeliveryJobOfferService()
		.createContainerDeliveryJobOffer(req.body)
		.then((result) => res.json(result))
		.catch(() => res.status(500).send("unsuccessful"));
});

module.exports = router;