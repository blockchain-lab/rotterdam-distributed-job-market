'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');
const ContainerDeliveryJobOfferService = require('./ContainerDeliveryJobOfferService');
const TruckerService = require('./TruckerService');

const ContainerDeliveryJobForList = require('../domain/ContainerDeliveryJobForList');
const ContainerDeliveryJobWithPassword = require('../domain/ContainerDeliveryJobWithPassword');
const ContainerDeliveryJobForTrucker = require('../domain/ContainerDeliveryJobForTrucker');

const AcceptContainerDeliveryCommand = require('../domain/tx/AcceptContainerDeliveryCommand');
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

		const params = {truckerRef: `resource:nl.tudelft.blockchain.logistics.Trucker#${truckerId}`};
		const queryPromise = await this.logisticsNetwork.executeNamedQuery('FindContractedJobsOfTrucker', params);
		const promiseToResolveResult = Promise.all(queryPromise.map((asset) => this.retrieveById(asset.getIdentifier())));

		return promiseToResolveResult.then((assets) => assets.map((asset) => new ContainerDeliveryJobForTrucker(asset)));
	}

	async retrieveContractedByContainerGuyId(containerGuyId)
	{
		console.log(`[retrieve(ContainerDeliveryJobWithPassword)] containerGuyId ${containerGuyId}`);

		const truckerService = new TruckerService();

		const resolveJobFn = (job, jobOffer) => {
			// query doesn't resolve the jobOffer, but we already have it
			job.jobOffer = jobOffer;
			// also need to resolve Trucker info in a bit of a hacky way
			// FIXME: not Trucker returned for now, just resolve the returned obj's from the final query I guess or add to Asset
			// Promise.resolve(truckerService.getTrucker(job.contractedTrucker.getIdentifier())
			// 	.then((trucker) => job.contractedTrucker = trucker));
			return new ContainerDeliveryJobForList(job);
		}

		const params = {containerGuyId: containerGuyId};
		const queryResult = await this.logisticsNetwork.executeNamedQuery('FindContractedJobOffersForContainerGuy', params);

		// cannot get Jobs directly, going through JobOffers, otherwise need to add the ContainerGuyId to the Job object too
		const promisesToResolveResult = queryResult.map(
			(jobOffer) => this.logisticsNetwork.executeNamedQuery('FindContractedJobsByJobOfferId', {containerDeliveryJobOfferRef: jobOffer.toURI()})
					.then((jobs) => jobs.map((job) => resolveJobFn(job, jobOffer)))
		);

		return Promise.all(promisesToResolveResult);
	}

	async acceptDelivery(containerDeliveryJobId, arrivalPassword)
	{
		console.log(`[acceptDelivery] for ContainerDeliveryJobId: ${containerDeliveryJobId}`);

		if (arrivalPassword === undefined) {
			arrivalPassword = await this.retrieveById(containerDeliveryJobId)
				.then((containerDeliveryJob) => containerDeliveryJob.getPassword());
		}

		return this.logisticsNetwork.submitTransaction(
			"nl.tudelft.blockchain.logistics",
			"AcceptContainerDelivery",
			(tx, factory) => {
				return new AcceptContainerDeliveryCommand({
					password: arrivalPassword,
					containerDeliveryJobId: containerDeliveryJobId
				}).hydrateTx(tx, factory);
			});
	}

	raiseException(containerDeliveryJobId, details)
	{
		console.log(`[raiseException] for ContainerDeliveryJobId: ${containerDeliveryJobId}`);

		var exc = {details: details};
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