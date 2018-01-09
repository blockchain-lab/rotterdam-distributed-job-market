/**
	Provides connection to the Composer implementation of the business network
	Based off https://github.com/hyperledger/composer-sample-applications/blob/master/packages/digitalproperty-app/lib/landRegistry.js
*/

'use strict';

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const config = require('config').get('logistics-app');
const cardname = config.get('cardname');

const truckerParticipantRegistryName = config.get('truckerParticipantRegistryName');
const containerDeliveryJobOfferAssetRegistryName = config.get('containerDeliveryJobOfferAssetRegistryName');

class LogisticsNetwork
{
	constructor()
	{
		this.bizNetworkConnection = new BusinessNetworkConnection();
	}

	init()
	{
		if (this.connectPromise === undefined)
		{
			this.connectPromise = this.bizNetworkConnection.connect(cardname)
				.then((result) => {
					this.businessNetworkDefinition = result;
				})
				.catch((error) => {
					throw error;
				});
		}

		return this.connectPromise;
	}

	getTruckerParticipantRegistry()
	{
		return this.init()
			.then(() => this.bizNetworkConnection.getParticipantRegistry(truckerParticipantRegistryName));
	}

	getContainerDeliveryJobOfferAssetRegistry()
	{
		return this.init()
			.then(() => this.bizNetworkConnection.getAssetRegistry(containerDeliveryJobOfferAssetRegistryName));
	}

	executeNamedQuery(queryName, queryParams)
	{
		return this.init()
			.then(() => this.bizNetworkConnection.query(queryName, queryParams));
	}

	serialize(obj)
	{
		// quick and dirty
		return this.init()
			.then(() => this.businessNetworkDefinition.getSerializer().toJSON(obj));
	}
}

module.exports = LogisticsNetwork;