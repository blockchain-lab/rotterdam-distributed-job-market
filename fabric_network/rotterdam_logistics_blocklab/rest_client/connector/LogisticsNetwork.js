/**
	Provides connection to the Composer implementation of the business network
	Based off https://github.com/hyperledger/composer-sample-applications/blob/master/packages/digitalproperty-app/lib/landRegistry.js
*/

'use strict';

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const IdCard = require('composer-common').IdCard;
const FileSystemCardStore = require('composer-common').FileSystemCardStore;
const BusinessNetworkCardStore = require('composer-common').BusinessNetworkCardStore;
const AdminConnection = require('composer-admin').AdminConnection;

const config = require('config').get('logistics-app');
const admin_cardname = config.get('cardname');

const truckerParticipantRegistryName = config.get('truckerParticipantRegistryName');
const containerDeliveryJobOfferAssetRegistryName = config.get('containerDeliveryJobOfferAssetRegistryName');
const containerDeliveryJobAssetRegistryName = config.get('containerDeliveryJobAssetRegistryName');

class LogisticsNetwork
{
	constructor(cardName) 
	{
	    this.currentParticipantId;
	    this.cardname = cardName === undefined ? admin_cardname : cardName;
		this.bizNetworkConnection = new BusinessNetworkConnection();
	}

	init()
	{
		if (this.connectPromise === undefined)
		{
			this.connectPromise = this.bizNetworkConnection.connect(this.cardname)
				.then((result) => {
				    this.businessNetworkDefinition = result;
				    this.serializer = this.businessNetworkDefinition.getSerializer();
				});
		}

		return this.connectPromise;
	}

	ping() 
	{
		return this.init()
			.then(() => this.bizNetworkConnection.ping());
	}

	logout()
	{
		// Not sure if deleting a card can be branded as "logout"
		return this.ping()
			.then(() => new AdminConnection().connect(admin_cardname))
			.then((adminConnection) => adminConnection.deleteCard(this.cardName));
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

	getContainerDeliveryJobAssetRegistry()
	{
		return this.init()
			.then(() => this.bizNetworkConnection.getAssetRegistry(containerDeliveryJobAssetRegistryName));
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
			.then((res) => this.bizNetworkConnection.getParticipantRegistry(`${namespace}.${type}`)
				.then((reg) => reg.add(res))
			);
	}

	static async importCardToNetwork(cardData)
	{
		let fileSystemCardStore = new FileSystemCardStore();
		let adminConnection = new AdminConnection({cardStore: fileSystemCardStore});
		let adminConnectionConnectPromise = adminConnection.connect(admin_cardname);

		let _idCardData = await IdCard.fromArchive(cardData);
		let _idCardName = await BusinessNetworkCardStore.getDefaultCardName(_idCardData);

		let isCardImportedAlready = adminConnectionConnectPromise.then(() => adminConnection.hasCard(_idCardName));

		if (!isCardImportedAlready) {
			// await fileSystemCardStore.put(_idCardName, _idCardData);
			await adminConnectionConnectPromise.then(() =>
				adminConnection.importCard(_idCardName, _idCardData)
			).then(() => adminConnection.ping());

			console.log(`\n\cardname: ${_idCardName}`);
		}

		return new LogisticsNetwork(_idCardName).init()
			.then(() => _idCardName);
	}
}

module.exports = LogisticsNetwork;