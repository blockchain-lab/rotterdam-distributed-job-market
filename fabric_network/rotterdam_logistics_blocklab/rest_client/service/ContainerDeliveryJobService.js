'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJob = require('../domain/ContainerDeliveryJob');

const AcceptContainerDeliveryCommand = require('../domain/tx/AcceptContainerDeliveryCommand');
const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');
const AcceptBidOnContainerDeliveryJobOfferCommand = require('../domain/tx/AcceptBidOnContainerDeliveryJobOfferCommand');

class ContainerDeliveryJobService
{
	constructor()
	{
		this.logisticsNetwork = new LogisticsNetwork();
	}

	/**
	 * @param {String} containerDeliveryJobId
	 * @return {Promise} ContainerDeliveryJob
	 */
	retrieveById(containerDeliveryJobId)
	{
		console.log("[retrieve(ContainerDeliveryJob)ById] for id: " + containerDeliveryJobId);

		return this.logisticsNetwork.getContainerDeliveryJobAssetRegistry()
			.then((registry) => registry.resolve(containerDeliveryJobId))
			.then((rawResult) => new ContainerDeliveryJob(rawResult));
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

}

module.exports = ContainerDeliveryJobService;