'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');

class TruckerBidOnContainerJobOfferService
{
    retriveAllBids(truckerId)
    {
    	throw new Error("not implemented");

    	// fixme: use query to get all bids of a Trucker
		return new LogisticsNetwork().getTruckerBidOnContainerJobOfferRegistry()
			.then((x) => x.getAll());
    }
}

module.exports = TruckerBidOnContainerJobOfferService;