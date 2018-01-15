'use strict';

class RaiseExceptionOnDeliveryJobCommand
{
	constructor(obj)
	{
		this.details = obj.details;
		this.exceptionTime = Date.now();
		this.containerDeliveryJobId = obj.containerDeliveryJobId;
	}

	hydrateTx(tx, factory)
	{
		tx.details = this.details;
		tx.exceptionTime = this.exceptionTime;

		tx.job = factory.newRelationship("nl.tudelft.logistics", "ContainerDeliveryJob", this.containerDeliveryJobId);

		return tx;
	}
}

module.exports = RaiseExceptionOnDeliveryJobCommand;