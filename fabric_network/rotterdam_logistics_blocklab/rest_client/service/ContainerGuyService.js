'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');

class ContainerGuyService
{
	/**
		@param {String} ContainerGuyId
		@return {Promise} of a List of ContainersJobOffers 
	*/
	fetchAllContainersByContainerGuyId(containerGuyId)
	{
		console.log("[fetchAllContainersByContainerGuyId] for containerGuyId: " + containerGuyId);

		return new LogisticsNetwork().executeNamedQuery('FindContainersByContainerGuyId', {containerGuyId: containerGuyId})
			.then((assets) => assets.map(x => new ContainerDeliveryJobOffer(x)))
			.catch((error) => {
				throw error;
			});
	}

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

module.exports = ContainerGuyService;