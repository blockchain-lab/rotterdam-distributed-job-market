'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');
const CreateContainerInfoCommand = require('../domain/tx/CreateContainerInfoCommand');

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

	CreateContainerInfo(containerInfo){
		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "CreateContainerInfo";

		const txExecutedPromise = new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) =>  {
				return new CreateContainerInfoCommand(containerInfo)
					.hydrateTx(tx, factory)
			}
		);

		return txExecutedPromise;
	}
}

module.exports = ContainerGuyService;