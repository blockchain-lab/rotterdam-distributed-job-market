'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

class ContainerGuyService {
	/**
		@param {String} ContainerGuyId
		@return {Promise} of a List of ContainersJobOffers 
	*/
	fetchAllContainersByContainerGuyId(containerGuyId) {
		console.log("[fetchAllContainersByContainerGuyId] for containerGuyId: " + containerGuyId);

		return new LogisticsNetwork().executeNamedQuery('FindContainersByContainerGuyId', {containerGuyId: containerGuyId})
			.catch((error) => {
				throw error;
			});
	}
}

module.exports = ContainerGuyService;