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

	/**
	 * {String} namespace - the namespace of the tx object
	 * {String} txName - the type/name of the Tx object
	 * {Function} fn(tx, factory) - a function that accepts the new tx object and populates the fields before the tx is submitted
	 * @return {Promise} of the submitted Tx object
	 */
	submitTransaction(namespace, txName, fn)
	{
		return this.init()
			.then(() => {
				const factory = this.businessNetworkDefinition.getFactory();
				const newTx = factory.newTransaction(namespace, txName);

				return fn(newTx, factory);
			})
			.then((tx) =>
				this.bizNetworkConnection.submitTransaction(tx)
			);
	}

	createParticipant(namespace, type, id, fn)
	{
		return this.init()
			.then(() => {
				const factory = this.businessNetworkDefinition.getFactory();
				const resource = factory.newResource(namespace, type, id);

				return fn(resource, factory);
			})
			.then((res) => 
				this.bizNetworkConnection.getParticipantRegistry(namespace + "." + type)
					.then((reg) => reg.add(res)
						.then()
						.catch((error) => {
							throw error;
						})
				)
			);
	}
}

module.exports = LogisticsNetwork;