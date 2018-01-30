'use strict';

const config = require('config');

class UpdateTruckerPreferencesCommand
{
	constructor(obj)
	{
		this.truckerId = obj.truckerId;
		this.truckCapacity = obj.truckCapacity;
	}

	hydrateTx(tx, factory)
	{
		tx.trucker = factory.newRelationship("nl.tudelft.blockchain.logistics", "Trucker", this.truckerId);

		tx.truckCapacity = this.truckCapacity;
		
		return tx;
	}
}

module.exports = UpdateTruckerPreferencesCommand;