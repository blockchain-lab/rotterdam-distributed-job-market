'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJob = require('../domain/ContainerDeliveryJob');

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
	 * @return {Promise} ContainerDeliveryJob
	 */
	retrieveById(containerDeliveryJobId)
	{
		console.log("[retrieve(ContainerDeliveryJob)ById] for id: " + containerDeliveryJobId);

		return this.logisticsNetwork.getContainerDeliveryJobAssetRegistry()
			.then((registry) => registry.resolve(containerDeliveryJobId))
			.then((rawResult) => new ContainerDeliveryJob(rawResult));
	}

	acceptDelivery(containerDeliveryJobId)
	{
		console.log(`[acceptDelivery] for ContainerDeliveryJobId: ${containerDeliveryJobId}`);

		let password = null;
		let passwordPromise = this.retrieveById(containerDeliveryJobId)
			.then((containerDeliveryJob) => containerDeliveryJob.getPassword());


		return this.logisticsNetwork.submitTransaction(
			"nl.tudelft.blockchain.logistics", "AcceptContainerDelivery",
			(tx, factory) => {
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