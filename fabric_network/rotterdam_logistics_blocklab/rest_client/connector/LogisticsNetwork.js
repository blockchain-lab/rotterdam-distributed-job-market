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

var fileSystemCardStore = new FileSystemCardStore();
var businessNetworkCardStore = new BusinessNetworkCardStore();
var adminConnection = new AdminConnection();

const config = require('config').get('logistics-app');
const cardname = config.get('cardname');

const truckerParticipantRegistryName = config.get('truckerParticipantRegistryName');
const containerDeliveryJobOfferAssetRegistryName = config.get('containerDeliveryJobOfferAssetRegistryName');
const containerDeliveryJobAssetRegistryName = config.get('containerDeliveryJobAssetRegistryName');

class LogisticsNetwork
{
	constructor(cardName) 
	{
	    this.currentParticipantId;
	    this.cardName = cardName;
		this.bizNetworkConnection = new BusinessNetworkConnection();
	}

	init()
	{
		var _this = this;
		if (this.connectPromise === undefined)
		{
			this.connectPromise = this.bizNetworkConnection.connect(this.cardname)
				.then((result) => {
				    _this.businessNetworkDefinition = result;
				    _this.serializer = _this.businessNetworkDefinition.getSerializer();
					this.businessNetworkDefinition = result;
				});
		}

		return this.connectPromise;
	}

	ping() {
		var _this = this;
		return this.bizNetworkConnection.ping().then(function (result) {
			return result
		})
	}

	logout() {
		var _this = this;

		return this.ping().then(function(){
			return AdminConnection.deleteCard(_this.cardName)
		})
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

	static importCardToNetwork(cardData) {
		var _idCardData, _idCardName;
		var businessNetworkConnection = new BusinessNetworkConnection();

		return IdCard.fromArchive(cardData).then(function(idCardData) {
			_idCardData = idCardData;
			return BusinessNetworkCardStore.getDefaultCardName(idCardData)
		}).then(function(idCardName) {
			_idCardName = idCardName;
			return fileSystemCardStore.put(_idCardName, _idCardData)
		}).then(function(result) {
			return adminConnection.importCard(_idCardName, _idCardData);
		})

		// .then(function(imported) {
		// 	if (imported) {
		// 		return businessNetworkConnection.connect(_idCardName)
		// 	} else {
		// 		return null;
		// 	}
		// }).then(function(businessNetworkDefinition){
		// 	if (!businessNetworkDefinition) {
		//   		return null
		// 	}
		// 	return _idCardName;
		// })
	}
}

module.exports = LogisticsNetwork;