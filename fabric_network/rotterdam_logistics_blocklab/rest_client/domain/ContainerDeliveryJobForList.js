'use strict';

const Trucker = require('../domain/Trucker');
const ContainerDeliveryJobOfferForList = require('../domain/ContainerDeliveryJobOfferForList');

class ContainerDeliveryJobForList
{
	constructor(obj)
	{
		this.containerDeliveryJobId = obj.containerDeliveryJobId;
		this.jobOffer = new ContainerDeliveryJobOfferForList(obj.jobOffer);
		// this.contractedTrucker = new Trucker(obj.contractedTrucker);

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

	getPassword()
	{
		return password;
	}
}

module.exports = ContainerDeliveryJobForList;