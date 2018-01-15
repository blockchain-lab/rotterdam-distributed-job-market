'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');
const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');
const AcceptBidOnContainerDeliveryJobOfferCommand = require('../domain/tx/AcceptBidOnContainerDeliveryJobOfferCommand');

class TruckerBidOnContainerJobOfferService
{
    retriveAllBids(truckerId)
    {
		return new LogisticsNetwork().getTruckerBidOnContainerJobOfferRegistry()
			.then((x) => x.getAll())
			.catch((error) => {
				throw error;
			});
    }
}

module.exports = TruckerBidOnContainerJobOfferService;