'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');

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
}

module.exports = ContainerGuyService;