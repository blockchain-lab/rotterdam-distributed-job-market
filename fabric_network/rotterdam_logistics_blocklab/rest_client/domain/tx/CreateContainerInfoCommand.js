'use strict';

const config = require('config');

class CreateContainerInfoCommand
{
	/**
	 * @param {domain.ContainerInfo} containerInfo
	 */
	constructor(containerInfo)
	{
		this.containerInfo = containerInfo;
	}

	hydrateTx(tx, factory)
	{
		tx.owner = factory.newRelationship("nl.tudelft.blockchain.logistics", "ContainerGuy", this.containerInfo.ownerId);
		tx.containerId = this.containerInfo.containerId;
		tx.containerSize = this.containerInfo.containerSize;
		tx.containerType = this.containerInfo.containerType;

		return tx;
	}
}

module.exports = CreateContainerInfoCommand;
