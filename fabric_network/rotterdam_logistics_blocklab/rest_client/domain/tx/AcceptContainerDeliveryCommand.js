'use strict';

class AcceptContainerDeliveryCommand
{
	constructor(obj)
	{
		this.arrivalTime = new Date();
		
		this.password = obj.password;
		this.containerDeliveryJobId = obj.containerDeliveryJobId;
	}

	hydrateTx(tx, factory)
	{
		tx.password = this.password;
		tx.arrivalDateTime = this.arrivalTime;

		tx.job = factory.newRelationship("nl.tudelft.blockchain.logistics", "ContainerDeliveryJob", this.containerDeliveryJobId);

		return tx;
	}
}

module.exports = AcceptContainerDeliveryCommand;