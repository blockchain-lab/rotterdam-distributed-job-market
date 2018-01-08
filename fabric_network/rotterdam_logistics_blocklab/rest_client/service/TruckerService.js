var config = require('config');
var LogisticsNetwork = require('../connector/LogisticsNetwork');

var TruckerPreferences = require('../domain/TruckerPreferences');

class TruckerService {
	/**
		@param {String} TruckerId
		@return {Promise} of a Trucker
	*/
	getTrucker(truckerId) {
		console.log("Got truckerId: " + truckerId);

		return new LogisticsNetwork().getTruckerParticipantRegistry()
			.then((truckerParticipantRegistry) => truckerParticipantRegistry.get(truckerId))
			.catch((error) => {
				throw error;
			});
	}

	/**
		@param {String} TruckerId
		@return {Promise} of a TruckerPreferences
	*/
	getTruckerPreferences(truckerId) {
		return this.getTrucker(truckerId)
			.then((trucker) => new TruckerPreferences(trucker));
	}
}

module.exports = TruckerService;