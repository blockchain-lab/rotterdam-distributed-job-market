'use strict';

class BidOnContainerDeliveryJobOfferCommand
{
	constructor(obj)
	{
        this.bidAmount = obj.bidAmount;
        this.containerDeliveryJobOfferId = obj.containerDeliveryJobOfferId;
        this.bidderId = obj.bidderId;
        
	}

	hydrateTx(tx, factory)
	{
		tx.containerDeliveryJobOffer = factory.newRelationship("nl.tudelft.blockchain.logistics", "ContainerDeliveryJobOffer", this.containerDeliveryJobOfferId);
		tx.bidder = factory.newRelationship("nl.tudelft.blockchain.logistics", "Trucker", this.bidderId);
        
        tx.bidAmount = this.bidAmount;

		return tx;
	}
}

module.exports = BidOnContainerDeliveryJobOfferCommand;