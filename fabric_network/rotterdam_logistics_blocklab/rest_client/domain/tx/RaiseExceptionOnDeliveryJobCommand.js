'use strict';

class RaiseExceptionOnDeliveryJobCommand
{
	constructor(obj)
	{
		this.exception = obj.exception;
		this.containerDeliveryJobId = obj.containerDeliveryJobId;
	}

	hydrateTx(tx, factory)
	{		
		tx.exception = factory.newConcept("nl.tudelft.blockchain.logistics", "Exception");
		tx.exception.details = this.exception.details;
		tx.exception.time = new Date();
		tx.containerDeliveryJob = factory.newRelationship("nl.tudelft.blockchain.logistics", "ContainerDeliveryJob", this.containerDeliveryJobId);
		return tx;
	}
}

module.exports = RaiseExceptionOnDeliveryJobCommand;