'use strict';

const Trucker = require('../domain/Trucker');
const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');

class ContainerDeliveryJobWithPassword
{
	constructor(obj)
	{
		this.containerDeliveryJobId = obj.containerDeliveryJobId;
		this.jobOffer = new ContainerDeliveryJobOffer(obj.jobOffer);
		this.contractedTrucker = new Trucker(obj.contractedTrucker);

		this.password = obj.arrivalPassword;

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

module.exports = ContainerDeliveryJobWithPassword;