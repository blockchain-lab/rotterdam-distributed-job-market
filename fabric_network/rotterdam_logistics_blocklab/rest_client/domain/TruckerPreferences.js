'use strict';

class TruckerPreferences
{
	constructor(trucker)
	{
		this.adrTraining = trucker.adrTraining;
		this.truckCapacity = trucker.truckCapacity;
	}

	getAdrTraining()
	{
		return adrTraining;
	}

	getTruckCapacity()
	{
		return truckCapacity;
	}
}

module.exports = TruckerPreferences;