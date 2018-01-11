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

	/**
	 * @param {String} containerDeliveryJobOfferId
	 * @return {Promise} ContainerDeliveryJobOffer
	 */
	 retrieveById(containerDeliveryJobOfferId)
	 {
	 	console.log("[retrieve(ContainerDeliveryJobOffer)ById] for id: " + containerDeliveryJobOfferId);

	 	return new LogisticsNetwork().getContainerDeliveryJobOfferAssetRegistry()
	 		.then((registry) => registry.get(containerDeliveryJobOfferId))
	 		.then((rawResult) => new ContainerDeliveryJobOffer(rawResult));
	 }


}

module.exports = ContainerDeliveryJobOfferService;