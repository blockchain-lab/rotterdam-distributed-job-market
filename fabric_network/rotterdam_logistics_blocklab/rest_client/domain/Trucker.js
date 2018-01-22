'use strict';

let TruckerRating = require('./TruckerRating');
let TruckerPreferences = require('./TruckerPreferences');

class Trucker
{
	constructor(obj)
	{
		console.log(obj);

		this.truckerId = obj.truckerId;
		this.firstName = obj.firstName;
		this.lastName = obj.lastName;

		this.rating = new TruckerRating(obj.rating);

		this.adrTraining = obj.adrTraining;
		this.truckCapacity = obj.truckCapacity;
		this.allowedDestinations = obj.allowedDestinations;
		
		this.availability = {
			from: obj.availability.from,
			to: obj.availability.to
		}
	}

	getRating()
	{
		return this.rating;
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

	getPreferences()
	{
		return new TruckerPreferences(this);
	}

	getAvailability()
	{
		return this.availability;
	}
}

module.exports = Trucker;