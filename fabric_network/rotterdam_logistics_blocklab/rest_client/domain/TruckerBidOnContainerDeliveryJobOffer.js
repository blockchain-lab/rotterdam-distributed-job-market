'use strict';

const Trucker = require('./Trucker');

class TruckerBidOnContainerDeliveryJobOffer
{
	constructor(obj)
	{
		this.bidAmount = obj.bidAmount;
		this.truckerBidId = obj.truckerBidId;

		this.bidder = new Trucker(obj.bidder);
	}

	getBidAmount()
	{
		return this.bidAmount;
	}

	getTruckerBidId()
	{
		return this.truckerBidId;
	}

	getBidder()
	{
		return this.bidder;
	}
}

module.exports = TruckerBidOnContainerDeliveryJobOffer;