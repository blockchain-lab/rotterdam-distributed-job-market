'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOfferForList = require('../domain/ContainerDeliveryJobOfferForList');
const CreateContainerGuyCommand = require('../domain/tx/CreateContainerGuyCommand');

class ContainerGuyService
{
	/**
		@param {String} ContainerGuyId
		@return {Promise} of a List of ContainersJobOfferForList (bid obj only has bidAmount)
	*/
	retrieveAllContainerDeliveryJobOffersByContainerGuyId(containerGuyId)
	{
		console.log("[fetchAllContainersByContainerGuyId] for containerGuyId: " + containerGuyId);

		return new LogisticsNetwork().executeNamedQuery('FindContainersByContainerGuyId', {containerGuyId: containerGuyId})
			.then((assets) => assets.map(x => new ContainerDeliveryJobOfferForList(x)))
			.catch((error) => {
				throw error;
			});
	}

	createContainerGuy(containerGuy)
	{
		const namespace = "nl.tudelft.blockchain.logistics";
		const typename = "ContainerGuy";

		return new LogisticsNetwork().createParticipant(
			namespace, 
			typename, 
			containerGuy.getContainerGuyId(), 
			(res, factory) => new CreateContainerGuyCommand(containerGuy)
				.hydrateTx(res, factory)
		);
	}


}

module.exports = ContainerGuyService;