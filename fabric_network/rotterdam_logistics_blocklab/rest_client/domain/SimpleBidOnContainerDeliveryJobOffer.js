'use strict'

class SimpleBidOnContainerDeliveryJobOffer
{
	constructor(obj)
	{
		this.bidAmount = obj.bidAmount;
	}

	getBidAmount()
	{
		return this.bidAmount;
	}
}