const router = require('express').Router();

const ContainerGuyService = require('../service/ContainerGuyService');
const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');

router.get('/allContainersOf/:containerGuyId', (req, res) => {
	const containerGuyId = req.params.containerGuyId;
	
	console.log("allContainersOf containerGuyId: " + containerGuyId);

	new ContainerGuyService().fetchAllContainersByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets));
});

router.post('/createContainerDeliveryJobOffer', (req, res) => {

	const command = new CreateContainerDeliveryJobOfferCommand(req.body);

	new ContainerGuyService()
		.createContainerDeliveryJobOffer(command)
		.then((result) => res.json(result))
		.catch(() => res.status(500).send("unsuccessful"));
});

module.exports = router;