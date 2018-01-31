'use strict';

const config = require('config');

const SimpleObjectInitializer = require('../../util/SimpleObjectInitializer');

class CreateContainerDeliveryJobOfferCommand
{
	/**
	 * @param {Object} obj - containing the requiredParams below, and a nested object called "destination" (see requiredDestinationParams below)
	 */
	constructor(obj)
	{
		const requiredParams = [
			"containerInfoId",
			"terminalContainerAvailableAt",
			"approxDistanceToDestination",
			"requiredAdrTraining",
			"availableForPickupDateTime",
			"toBeDeliveredByDateTime",
			"destination"
		];
		SimpleObjectInitializer.setRequiredValues(requiredParams, obj, this);

		this.destination = {};
		const requiredDestinationParams = ["street", "city", "country" ];
		SimpleObjectInitializer.setRequiredValues(requiredDestinationParams, obj.destination, this.destination);

		// optional
		this.destination.housenumber = obj.destination.housenumber;

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

		tx.destinationHousenumber = this.destination.housenumber;
		tx.destinationStreet = this.destination.street;
		tx.destinationCity = this.destination.city;
		tx.destinationCountry = this.destination.country;

		tx.approxDistanceToDestination = this.approxDistanceToDestination;

		tx.availableForPickupDateTime = this.availableForPickupDateTime;
		tx.toBeDeliveredByDateTime = this.toBeDeliveredByDateTime;

		tx.requiredAdrTraining = this.requiredAdrTraining;

		return tx;
	}
}

module.exports = CreateContainerDeliveryJobOfferCommand;
