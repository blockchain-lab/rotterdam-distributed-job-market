/**
	Provides connection to the Composer implementation of the business network
	Based off https://github.com/hyperledger/composer-sample-applications/blob/master/packages/digitalproperty-app/lib/landRegistry.js
*/

'use strict';

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

let config = require('config').get('logistics-app');
let cardname = config.get('cardname');

let truckerAssetRegistryName = config.get('truckerAssetRegistryName');

class LogisiticsNetwork
{
	constructor()
	{
		this.bizNetworkConnection = new BusinessNetworkConnection();
	}

	init()
	{
		if (this.connectPromise === undefined)
		{
			this.bizNetworkConnection.connect(cardname)
				.then((result) => {
					this.businessNetworkDefinition = result;
				})
				.catch((error) => {
					throw error;
				});
		}

		return this.connectPromise;
	}

	getTruckerAssetRegistry()
	{
		return init()
			.then(() => this.bizNetworkConnection.getAssetRegistry(truckerAssetRegistryName));
	}
}