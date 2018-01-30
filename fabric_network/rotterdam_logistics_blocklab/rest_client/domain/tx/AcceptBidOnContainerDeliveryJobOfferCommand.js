'use strict';

class AcceptBidOnContainerDeliveryJobOfferCommand
{
	constructor(obj)
	{
		this.truckerBidId = obj.truckerBidId;
	}

	getContainerDeliveryJobOfferId()
	{
		return this.containerDeliveryJobOfferId;
	}

	getTruckerBidId()
	{
		return this.truckerBidId;
	}

	hydrateTx(tx, factory)
	{
		tx.acceptedBid = factory.newRelationship("nl.tudelft.blockchain.logistics", "TruckerBidOnContainerJobOffer", this.truckerBidId);

		return tx;
	}
}

module.exports = AcceptBidOnContainerDeliveryJobOfferCommand;