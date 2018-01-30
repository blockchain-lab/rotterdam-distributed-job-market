const DistanceService = require('./distance/DistanceService');
const Address = require('./distance/model/Address');

let distanceService = new DistanceService();

let address = new Address({street: "piet paaltjensstraat", city: "den haag", country: "nederland"});

// distanceService.determineApproximateDistanceTo(address)
// 	.then((result) => console.log("\n\n approx distance: " + result));


for (var i = 10000; i < 100000; i += 100)
{
	console.log(`${i} : ${distanceService.postProcessDistance(i)}`);	
}
