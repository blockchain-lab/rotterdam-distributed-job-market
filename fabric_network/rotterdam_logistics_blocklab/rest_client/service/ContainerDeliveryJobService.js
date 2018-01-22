'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');
const ContainerDeliveryJobOfferService = require('./ContainerDeliveryJobOfferService');

const ContainerDeliveryJobWithPassword = require('../domain/ContainerDeliveryJobWithPassword');
const ContainerDeliveryJobForTrucker = require('../domain/ContainerDeliveryJobForTrucker');

const AcceptContainerDeliveryCommand = require('../domain/tx/AcceptContainerDeliveryCommand');
const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');
const AcceptBidOnContainerDeliveryJobOfferCommand = require('../domain/tx/AcceptBidOnContainerDeliveryJobOfferCommand');
const RaiseExceptionOnDeliveryJobCommand = require('../domain/tx/RaiseExceptionOnDeliveryJobCommand');

class ContainerDeliveryJobService
{
	constructor()
	{
		this.logisticsNetwork = new LogisticsNetwork();
	}

	/**
	 * @param {String} containerDeliveryJobId
	 * @return {Promise} ContainerDeliveryJobWithPassword
	 */
	retrieveById(containerDeliveryJobId)
	{
		console.log("[retrieve(ContainerDeliveryJobWithPassword)ById] for id: " + containerDeliveryJobId);

		return this.logisticsNetwork.getContainerDeliveryJobAssetRegistry()
			.then((registry) => registry.resolve(containerDeliveryJobId))
			.then((rawResult) => new ContainerDeliveryJobWithPassword(rawResult));
	}

	async retrieveContractedByTruckerId(truckerId)
	{
		console.log(`[retrieve(ContainerDeliveryJobForTrucker)] truckerId ${truckerId}`);

		let assets = await this.logisticsNetwork.executeNamedQuery('FindContractedJobsOfTrucker', {truckerRef: `resource:nl.tudelft.blockchain.logistics.Trucker#${truckerId}`});
		let promiseToResolveResult = assets.map((asset) => this.retrieveById(asset.getIdentifier()));

		return Promise.all(promiseToResolveResult)
			.then((assets) => assets.map((asset) => new ContainerDeliveryJobForTrucker(asset)));
	}

	acceptDelivery(containerDeliveryJobId, arrivalPassword)
	{
		console.log(`[acceptDelivery] for ContainerDeliveryJobId: ${containerDeliveryJobId}`);

		let password = arrivalPassword; // will be overwritten by the promise if the argument was not passed in
		let passwordPromise = arrivalPassword === undefined 
			? this.retrieveById(containerDeliveryJobId).then((containerDeliveryJob) => {password = containerDeliveryJob.getPassword();})
			: Promise.resolve(arrivalPassword); // wrap the provided password argument into a promise

		return this.logisticsNetwork.submitTransaction(
			"nl.tudelft.blockchain.logistics", "AcceptContainerDelivery",
			(tx, factory) => {
				// Make sure the passwordPromise is resolved before continueing
				Promise.resolve(passwordPromise);

				return new AcceptContainerDeliveryCommand({
					password: password,
					containerDeliveryJobId: containerDeliveryJobId
				})
			});
	}

	raiseException(containerDeliveryJobId, details)
	{
		console.log(`[raiseException] for ContainerDeliveryJobId: ${containerDeliveryJobId}`);
		var exc = {"details":details};
		return this.logisticsNetwork.submitTransaction(
			"nl.tudelft.blockchain.logistics", 
			"RaiseExceptionOnDeliveryJob",
			(tx, factory) => {
				return new RaiseExceptionOnDeliveryJobCommand({
					containerDeliveryJobId: containerDeliveryJobId,
					exception: exc
					}).hydrateTx(tx, factory);
			});
	}
}

module.exports = ContainerDeliveryJobService;