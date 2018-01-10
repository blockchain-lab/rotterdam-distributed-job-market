'use strict';

var TruckerAvailability = require('./TruckerAvailability');

class TruckerPreferences
{
	constructor(trucker)
	{
		this.allowedDestinations = trucker.allowedDestinations;
		this.adrTraining = trucker.adrTraining;
		this.truckCapacity = trucker.truckCapacity;
		this.availability = new TruckerAvailability(trucker.availability);
	}

	getAllowedDestinations()
	{
		return allowedDestinations;
	}

	getAdrTraining()
	{
		return adrTraining;
	}

	getTruckCapacity()
	{
		return truckCapacity;
	}

	getAvailability()
	{
		return availability;
	}
}

module.exports = TruckerPreferences;