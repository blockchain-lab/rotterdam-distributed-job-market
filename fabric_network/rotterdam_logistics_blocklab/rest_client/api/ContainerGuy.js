const router = require('express').Router();

const TruckerService = require('../service/ContainerGuyService');

// todo: don't use this, write a domain object instead
const LogisticsNetwork = require('../connector/LogisticsNetwork');

router.get('/allContainersOf/:containerGuyId', (req, res) => {
	const containerGuyId = req.params.containerGuyId;
	
	console.log("allContainersOf containerGuyId: " + containerGuyId);

	new TruckerService().fetchAllContainersByContainerGuyId(containerGuyId)
		.then((assets) => {
			console.log(assets);
			res.json(assets);


			
			// Promise.all(assets.map(x => logisticsNetwork.serialize(x)))
			// 	.then((assets) => {
			// 		console.log("serialized: " + assets);
			// 	});

			// var promises = [];

			// assets.forEach(obj => {
			// 	var promise = logisticsNetwork.serialize(obj).then((serializedObj) => serializedAssets.push(serializedObj));
			// 	promises.push(promise);
			// });
			// var all = Promise.all(promises);

			// console.log("serialized assets: " + serializedAssets);
			// console.log("promises: " + all);

			// res.json(serializedAssets);
		});
});

module.exports = router;