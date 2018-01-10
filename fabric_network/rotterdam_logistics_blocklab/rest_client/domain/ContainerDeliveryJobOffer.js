'use strict';

class ContainerDeliveryJobOffer
{
	constructor(containerDeliveryJobOffer)
	{
		this.containerDeliveryJobOfferId = containerDeliveryJobOffer.containerDeliveryJobOfferId;
		this.containerGuyId = containerDeliveryJobOffer.containerGuyId;
		this.availableForPickupDateTime = containerDeliveryJobOffer.availableForPickupDateTime;
		this.toBeDeliveredByDateTime = containerDeliveryJobOffer.toBeDeliveredByDateTime;
		this.destination = containerDeliveryJobOffer.destination;
		this.requiredAdrTraining = containerDeliveryJobOffer.requiredAdrTraining;
		this.containerBids = containerDeliveryJobOffer.containerBids;
		this.status = containerDeliveryJobOffer.status;
		this.canceled = containerDeliveryJobOffer.canceled;
	}

	getContainerDeliveryJobOfferId()
	{
		return this.containerDeliveryJobOfferId;
	}

	getContainerGuyId()
	{
		return this.containerGuyId;
	}

	getAvailableForPickupDateTime()
	{
		return this.availableForPickupDateTime;
	}

	getToBeDeliveredByDateTime()
	{
		return this.toBeDeliveredByDateTime;
	}

	getDestination()
	{
		return this.destination;
	}

	getRequiredAdrTraining()
	{
		return this.requiredAdrTraining;
	}

	getContainerBids()
	{
		return this.containerBids;
	}

	getStatus()
	{
		return this.status;
	}

	getCanceled()
	{
		return this.canceled;
	}
}

module.exports = ContainerDeliveryJobOffer;