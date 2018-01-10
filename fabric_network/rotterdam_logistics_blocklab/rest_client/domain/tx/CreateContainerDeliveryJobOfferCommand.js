'use strict';

const config = require('config');

class CreateContainerDeliveryJobOfferCommand
{
	constructor(obj)
	{
		this.containerInfoId = obj.containerInfoId;

		this.terminalContainerAvailableAt = obj.terminalContainerAvailableAt;
		this.destination = obj.destination;

		this.availableForPickupDateTime = new Date(obj.availableForPickupDateTime);
		this.toBeDeliveredByDateTime = new Date(obj.toBeDeliveredByDateTime);

		this.requiredAdrTraining = obj.requiredAdrTraining;
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
		tx.destination = this.destination;

		tx.availableForPickupDateTime = this.availableForPickupDateTime;
		tx.toBeDeliveredByDateTime = this.toBeDeliveredByDateTime;

		tx.requiredAdrTraining = this.requiredAdrTraining;

		return tx;
	}
}

module.exports = CreateContainerDeliveryJobOfferCommand;
