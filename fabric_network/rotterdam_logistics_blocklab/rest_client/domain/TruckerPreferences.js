'use strict';

var TruckerAvailability = require('./TruckerAvailability');

class TruckerPreferences
{
	constructor(trucker)
	{
		this._allowedDestinations = trucker.allowedDestinations;
		this._adrTraining = trucker.adrTraining;
		this._truckCapacity = trucker.truckCapacity;
		this._availability = new TruckerAvailability(trucker.availability);
	}

	get allowedDestinations()
	{
		return _allowedDestinations;
	}

	get adrTraining()
	{
		return _adrTraining;
	}

	get truckCapacity()
	{
		return _truckCapacity;
	}

	get availability()
	{
		return _availability;
	}
}

module.exports = TruckerPreferences;