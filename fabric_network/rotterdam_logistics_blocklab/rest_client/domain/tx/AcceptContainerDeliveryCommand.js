'use strict';

class AcceptContainerDeliveryCommand
{
	constructor(obj)
	{
		this.password = obj.password;
		this.arrivalTime = Date.now();
		this.containerDeliveryJobId = obj.containerDeliveryJobId;
	}

	hydrateTx(tx, factory)
	{
		tx.password = this.password;
		tx.arrivalDateTime = this.arrivalTime;

		tx.job = factory.newRelationship("nl.tudelft.logistics", "ContainerDeliveryJob", this.containerDeliveryJobId);

		return tx;
	}
}

module.exports = AcceptContainerDeliveryCommand;