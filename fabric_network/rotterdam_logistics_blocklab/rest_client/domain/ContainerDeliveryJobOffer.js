'use strict';
const TruckerBidOnContainerDeliveryJobOffer = require('./TruckerBidOnContainerDeliveryJobOffer');

class ContainerDeliveryJobOffer
{
	constructor(obj)
	{
		this.containerDeliveryJobOfferId = obj.containerDeliveryJobOfferId;
		this.containerGuyId = obj.containerGuyId;
		
		this.availableForPickupDateTime = obj.availableForPickupDateTime;
		this.toBeDeliveredByDateTime = obj.toBeDeliveredByDateTime;
		this.destination = `${obj.destination.city}, ${obj.destination.country}`;
		this.approxDistanceToDestination = obj.approxDistanceToDestination;
		this.requiredAdrTraining = obj.requiredAdrTraining;
		
		this.containerBids = obj.containerBids.map(
				(bid) => new TruckerBidOnContainerDeliveryJobOffer(bid)
			);
		
		this.status = obj.status;
		this.canceled = obj.canceled;
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