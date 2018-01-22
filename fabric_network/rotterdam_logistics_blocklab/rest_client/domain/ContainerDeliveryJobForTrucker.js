'use strict';

const Trucker = require('../domain/Trucker');
const ContainerDeliveryJobOfferForTrucker = require('../domain/ContainerDeliveryJobOfferForTrucker');

class ContainerDeliveryJobForTrucker
{
	constructor(obj)
	{
		this.containerDeliveryJobId = obj.containerDeliveryJobId;
		this.jobOffer = new ContainerDeliveryJobOfferForTrucker(obj.jobOffer);
		this.contractedTrucker = new Trucker(obj.contractedTrucker);

		this.arrivalDateTime = obj.arrivalDateTime === undefined ? null : obj.arrivalDateTime;
	}

	getContainerDeliveryJobId()
	{
		return containerDeliveryJobId;
	}

	getJobOffer()
	{
		return jobOffer;
	}

	getContractedTrucker()
	{
		return contractedTrucker;
	}

	getArrivalDateTime()
	{
		return arrivalDateTime;
	}
}

module.exports = ContainerDeliveryJobForTrucker;