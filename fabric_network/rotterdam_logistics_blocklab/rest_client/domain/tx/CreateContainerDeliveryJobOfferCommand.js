'use strict';

const config = require('config');

const SimpleObjectInitializer = require('../../util/SimpleObjectInitializer');

class CreateContainerDeliveryJobOfferCommand
{
	constructor(obj)
	{
		const requiredParams = [
			"containerInfoId",
			"terminalContainerAvailableAt",
			"destinationStreet",
			"destinationCity",
			"destinationCountry",
			"approxDistanceToDestination",
			"requiredAdrTraining",
			"availableForPickupDateTime",
			"toBeDeliveredByDateTime"
		];
		SimpleObjectInitializer.setRequiredValues(requiredParams, obj, this);

		// optional
		this.destinationHousenumber = obj.destinationHousenumber;

		// convert these values into Date objects
		this.availableForPickupDateTime = new Date(this.availableForPickupDateTime);
		this.toBeDeliveredByDateTime = new Date(this.toBeDeliveredByDateTime);
	}

	getContainerInfoId()
	{
		return this.containerInfoId;
	}

	getTerminalContainerAvailableAt()
	{
		return this.terminalContainerAvailableAt;
	}

	getDestination()
	{
		return this.destination;
	}

	getAvailableForPickupDateTime()
	{
		return this.availableForPickupDateTime;
	}

	getToBeDeliveredByDateTime()
	{
		return this.toBeDeliveredByDateTime;
	}

	getRequiredAdrTraining()
	{
		return this.requiredAdrTraining;
	}

	hydrateTx(tx, factory)
	{
		tx.containerInfo = factory.newRelationship("nl.tudelft.blockchain.logistics", "ContainerInfo", this.containerInfoId);
		
		tx.terminalContainerAvailableAt = this.terminalContainerAvailableAt;

		tx.destinationHousenumber = this.destinationHousenumber;
		tx.destinationStreet = this.destinationStreet;
		tx.destinationCity = this.destinationCity;
		tx.destinationCountry = this.destinationCountry;

		tx.approxDistanceToDestination = this.approxDistanceToDestination;

		tx.availableForPickupDateTime = this.availableForPickupDateTime;
		tx.toBeDeliveredByDateTime = this.toBeDeliveredByDateTime;

		tx.requiredAdrTraining = this.requiredAdrTraining;

		return tx;
	}
}

module.exports = CreateContainerDeliveryJobOfferCommand;
