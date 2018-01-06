class TruckerPreferences
{
	constructor(trucker)
	{
		this.allowedDestinations = trucker.allowedDestinations;
		this.adrTraining = trucker.adrTraining;
		this.truckCapacity = trucker.truckCapacity;
		this.availability = new TruckerAvailability(trucker.availability);
	}

	get allowedDestinations()
	{
		return this.allowedDestinations;
	}

	get adrTraining()
	{
		return this.adrTraining;
	}

	get truckCapacity()
	{
		return this.truckCapacity;
	}

	get availability()
	{
		return this.availability;
	}
}