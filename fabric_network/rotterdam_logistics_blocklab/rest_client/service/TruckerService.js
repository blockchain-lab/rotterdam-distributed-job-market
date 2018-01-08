var TruckerPreferences = require('../domain/TruckerPreferences');

var config = require('config');
var logisticsNetwork = require('../connector/LogisticsNetwork');

// var composerBaseURL = process.env.COMPOSER_BASE_URL || config.get('composerApiUrl');

/**
	@return {Promise} of a trucker
*/
var getTrucker = (truckerId) => {
	console.log("Got truckerId: " + truckerId);

	return logisticsNetwork.getTruckerParticipantRegistry()
		.then((truckerParticipantRegistry) => truckerParticipantRegistry.get(truckerId))
		.catch((error) => {
			throw error;
		});
}

var getTruckerPreferences = (truckerId) => {

	return getTrucker(truckerId)
		.then((trucker) => new TruckerPreferences(trucker));
}

module.exports = {
	getTruckerPreferences: getTruckerPreferences,
	getTrucker: getTrucker
}