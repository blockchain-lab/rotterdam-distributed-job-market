'use strict';

class CancelBidCommand
{
	constructor(obj)
	{
		this.truckerBidId = obj.truckerBidId;
	}

	getTruckerBidId()
	{
		return this.truckerBidId;
	}

	hydrateTx(tx, factory)
	{
		tx.truckerBid = factory.newRelationship("nl.tudelft.blockchain.logistics", "TruckerBidOnContainerJobOffer", this.truckerBidId);

		return tx;
	}
}

module.exports = CancelBidCommand;