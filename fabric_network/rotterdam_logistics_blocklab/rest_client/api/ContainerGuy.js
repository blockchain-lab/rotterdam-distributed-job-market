const router = require('express').Router();

const TruckerService = require('../service/ContainerGuyService');

router.get('/allContainersOf/:containerGuyId', (req, res) => {
	const containerGuyId = req.params.containerGuyId;
	
	console.log("allContainersOf containerGuyId: " + containerGuyId);

	new TruckerService().fetchAllContainersByContainerGuyId(containerGuyId)
		.then((assets) => res.json(assets));
});

module.exports = router;