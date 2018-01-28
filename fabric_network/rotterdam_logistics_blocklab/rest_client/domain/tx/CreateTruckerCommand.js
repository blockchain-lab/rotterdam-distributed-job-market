'use strict';


class CreateTruckerCommand
{
	constructor(trucker)
	{
		this.trucker = trucker;
	}

	hydrateTx(tx, factory)
	{
		tx.firstName = this.trucker.firstName;
		tx.lastName = this.trucker.lastName;
		tx.adrTraining = this.trucker.adrTraining;
		tx.truckCapacity = this.trucker.truckCapacity;

		tx.rating = factory.newConcept("nl.tudelft.blockchain.logistics", "TruckerRating");
		tx.rating.jobsDelivered = this.trucker.rating.jobsDelivered;
		tx.rating.totalPastJobsAccepted = this.trucker.rating.totalPastJobsAccepted;

		return tx;
	}
}

module.exports = CreateTruckerCommand;