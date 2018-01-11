'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');

class ContainerDeliveryJobOfferService
{
	/**
	 * @param {domain.tx.CreateContainerDeliveryJobOfferCommand}
	 */
	createContainerDeliveryJobOffer(createContainerDeliveryJobOfferCommand)
	{
		console.log("[createContainerDeliveryJobOffer] for containerInfoId: " + createContainerDeliveryJobOfferCommand.containerInfoId);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "CreateContainerDeliveryJobOffer";

		const txExecutedPromise = new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) => createContainerDeliveryJobOfferCommand.hydrateTx(tx, factory)
		);

		return txExecutedPromise;
	}


}

module.exports = ContainerDeliveryJobOfferService;