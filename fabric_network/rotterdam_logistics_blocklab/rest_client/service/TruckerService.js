var truckerPreferences = require('../domain/TruckerPreferences');

var config = require('config');
var logisticsNetwork = require('../connector/LogisticsNetwork');

// var composerBaseURL = process.env.COMPOSER_BASE_URL || config.get('composerApiUrl');

/**
	@return {Promise} of a trucker
*/
var getTrucker = (truckerId) => {
	var network = new LogisticsNetwork();

	return network.getTruckerAssetRegistry()
		.then((truckerAssetRegistry) => truckerAssetRegistry.get(truckerId))
		.catch((error) => {
			throw error;
		});
}

var getTruckerPreferences = (truckerId) => {

	return getTrucker(truckerId)
		.then((trucker) => new TruckerPreferences(trucker));
}