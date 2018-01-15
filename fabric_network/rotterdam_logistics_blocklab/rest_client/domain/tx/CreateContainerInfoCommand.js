'use strict';

const config = require('config');

class CreateContainerInfoCommand
{
	constructor(obj)
	{
		this.containerId = obj.containerId;
		this.ownerId = obj.ownerId;
		this.containerSize = obj.containerSize;
		this.containerType = obj.containerType;
	}

	getOwnerId()
	{
		return ownerId;
	}

	getContainerSize()
	{
		return containerSize;
	}

	getContainerType()
	{
		return containerType;
	}

	getContainerId()
	{
		return containerId;
	}

	hydrateTx(tx, factory)
	{
		tx.owner = factory.newRelationship("nl.tudelft.blockchain.logistics", "ContainerGuy", this.ownerId);
		tx.containerId = this.containerId;
		tx.containerSize = this.containerSize;
		tx.containerType = this.containerType;
		return tx;
	}
}

module.exports = CreateContainerInfoCommand;
