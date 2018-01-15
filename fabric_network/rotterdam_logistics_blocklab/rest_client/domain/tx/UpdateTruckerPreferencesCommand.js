'use strict';

const config = require('config');

class UpdateTruckerPreferencesCommand
{
	constructor(obj)
	{
		this.truckerId = obj.truckerId;
		this.truckCapacity = obj.truckCapacity;
		this.availableFrom =  new Date(obj.availableFrom);
		this.availableTo =  new Date(obj.availableTo);
		this.allowedDestinations = obj.allowedDestinations;
	}

	hydrateTx(tx, factory)
	{
		tx.trucker = factory.newRelationship("nl.tudelft.blockchain.logistics", "Trucker", this.truckerId);

		tx.truckCapacity = this.truckCapacity;
		tx.availableFrom = this.availableFrom;
		tx.availableTo = this.availableTo;
		tx.allowedDestinations = this.allowedDestinations;
		
		return tx;
	}
}

module.exports = UpdateTruckerPreferencesCommand;