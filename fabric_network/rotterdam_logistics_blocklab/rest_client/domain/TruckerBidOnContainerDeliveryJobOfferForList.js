'use strict';

class TruckerBidOnContainerDeliveryJobOfferForList
{
	constructor(obj)
	{
		this.bidAmount = obj.bidAmount;
		this.truckerBidId = obj.truckerBidId;
	}

	getBidAmount()
	{
		return this.bidAmount;
	}

	getTruckerBidId()
	{
		return this.truckerBidId;
	}
}

module.exports = TruckerBidOnContainerDeliveryJobOfferForList;