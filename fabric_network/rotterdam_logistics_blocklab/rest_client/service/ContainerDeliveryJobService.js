'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobWithPassword = require('../domain/ContainerDeliveryJobWithPassword');

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

		return this.logisticsNetwork.submitTransaction(
			"nl.tudelft.blockchain.logistics", "RaiseExceptionOnDeliveryJob",
			(tx, factory) => {
				return new RaiseExceptionOnDeliveryJobCommand({
					containerDeliveryJobId: containerDeliveryJobId,
					details: details
				})
			});
	}

}

module.exports = ContainerDeliveryJobService;