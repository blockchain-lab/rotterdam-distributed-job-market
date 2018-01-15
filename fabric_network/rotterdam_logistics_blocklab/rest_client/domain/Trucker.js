'use strict';

class Trucker
{
	constructor(obj)
	{
		console.log(obj);

		this.truckerId = obj.truckerId;
		this.firstName = obj.firstName;
		this.lastName = obj.lastName;

		this.adrTraining = obj.adrTraining;
		this.truckCapacity = obj.truckCapacity;
		this.allowedDestinations = obj.allowedDestinations;
		this.truckerBids = obj.truckerBids.map(
			(bid) => new TruckerBidOnContainerDeliveryJobOffer(bid)
		);
		
		this.availability = {
			from: obj.availability.from,
			to: obj.availability.to
		}
	}

	getTruckerId()
	{
		return this.truckerId;
	}

	getFirstName()
	{
		return this.firstName;
	}

	getLastName()
	{
		return this.lastName;
	}

	getAdrTraining()
	{
		return this.adrTraining;
	}

	getTruckCapacity()
	{
		return this.truckCapacity;
	}

	getAllowedDestinations()
	{
		return this.allowedDestinations;
	}

	getAvailability()
	{
		return this.availability;
	}

	getTruckerBids()
	{
		return this.truckerBids;
	}
}

module.exports = Trucker;