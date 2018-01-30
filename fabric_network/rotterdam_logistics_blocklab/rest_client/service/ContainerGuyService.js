'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOfferForList = require('../domain/ContainerDeliveryJobOfferForList');
const ContainerInfo = require('../domain/ContainerInfo');
const CreateContainerGuyCommand = require('../domain/tx/CreateContainerGuyCommand');

class ContainerGuyService
{
	/**
		@param {String} containerGuyRef
		@return {Promise} of a List of ContainerInfo (bid obj only has bidAmount)
	*/
	retrieveAllContainerInfoByContainerGuyId(containerGuyId)
	{
		console.log("FindContainerInfoByContainerGuyId for : " + containerGuyId);
		let containerGuyRef = "resource:nl.tudelft.blockchain.logistics.ContainerGuy#" + containerGuyId;
		return new LogisticsNetwork().executeNamedQuery('FindContainerInfoByContainerGuyId', {containerGuyRef: containerGuyRef})
			.then((assets) => assets.map(x => new ContainerInfo(x)))
			.catch((error) => {
				throw error;
			});
	}

	/**
		@param {String} ContainerGuyId
		@return {Promise} of a List of ContainersJobOfferForList (bid obj only has bidAmount)
	*/
	retrieveAllContainerDeliveryJobOffersByContainerGuyId(containerGuyId)
	{
		console.log("FindContainerDeliveryJobOffersByContainerGuyId for : " + containerGuyId);

		return new LogisticsNetwork().executeNamedQuery('FindContainerDeliveryJobOffersByContainerGuyId', {containerGuyId: containerGuyId})
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