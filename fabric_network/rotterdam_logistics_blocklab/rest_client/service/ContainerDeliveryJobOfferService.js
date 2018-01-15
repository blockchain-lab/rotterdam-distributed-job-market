'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');
const ContainerDeliveryJobOfferForList = require('../domain/ContainerDeliveryJobOfferForList');
const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');
const AcceptBidOnContainerDeliveryJobOfferCommand = require('../domain/tx/AcceptBidOnContainerDeliveryJobOfferCommand');
const CancelBidCommand = require('../domain/tx/CancelBidCommand');
const BidOnContainerDeliveryJobOfferCommand = require('../domain/tx/BidOnContainerDeliveryJobOfferCommand');
const TruckerService = require('./TruckerService')


class ContainerDeliveryJobOfferService
{
	/** TODO: expand argument into arguments
	 * @param {CTO object of CreateContainerDeliveryJobOffer} createContainerDeliveryJobOffer
	 */
	createContainerDeliveryJobOffer(createContainerDeliveryJobOffer)
	{
		console.log("[createContainerDeliveryJobOffer] for containerInfoId: " + createContainerDeliveryJobOffer.containerInfoId);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "CreateContainerDeliveryJobOffer";

		const txExecutedPromise = new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) =>  {
				return new CreateContainerDeliveryJobOfferCommand(createContainerDeliveryJobOffer)
					.hydrateTx(tx, factory)
			}
		);

		return txExecutedPromise;
	}

	/**
	 * @param {String} containerDeliveryJobOfferId
	 * @return {Promise} ContainerDeliveryJobOffer
	 */
	retrieveById(containerDeliveryJobOfferId)
	{
		console.log("[retrieve(ContainerDeliveryJobOffer)ById] for id: " + containerDeliveryJobOfferId);

		return new LogisticsNetwork().getContainerDeliveryJobOfferAssetRegistry()
			.then((registry) => registry.resolve(containerDeliveryJobOfferId))
			.then((rawResult) => new ContainerDeliveryJobOffer(rawResult));
	}

	/**
	 * @param {TruckerBidId}
	 * @return {Promise} of AcceptBidStatus
	 */
	acceptBid(containerDeliveryJobOfferId, truckerBidId)
	{
		console.log(`[acceptBid] for containerDeliveryJobOfferId: ${containerDeliveryJobOfferId} and truckerBidId: ${truckerBidId}`);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "AcceptBidOnContainerDeliveryJobOffer";

		return new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) => {
				return new AcceptBidOnContainerDeliveryJobOfferCommand({
					containerDeliveryJobOfferId: containerDeliveryJobOfferId, 
					truckerBidId: truckerBidId
				}).hydrateTx(tx, factory);
			});
	}

	/**
	 * @param {String} containerDeliveryJobOfferId
	 * @return {Promise} TruckerBidOnContainerJobOffer[]
	 */
	retrieveTruckerBidsForContainer(containerDeliveryJobOfferId)
	{
		return retrieveById(containerDeliveryJobOfferId)
			.then((assets) => assets.map(x => new ContainerDeliveryJobOffer(x).getContainerBids()));
	}

	/**
	 * @param {String} containerDeliveryJobOfferId
	 * @return {Promise} TruckerBidOnContainerJobOffer[]
	 */
	cancelBid(containerDeliveryJobOfferId, truckerBidId)
	{
		console.log(`[cancelBid] cancel bid ${truckerBidId} on ${containerDeliveryJobOfferId}`);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "CancelBid";

		return new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) => {
				return new CancelBidCommand({
					containerDeliveryJobOfferId: containerDeliveryJobOfferId, 
					truckerBidId: truckerBidId
				}).hydrateTx(tx, factory);
			});
	}

	/**
	 * @param {String} containerDeliveryJobOfferId
	 * @return {Promise} TruckerBidOnContainerJobOffer[]
	 */
	submitBid(containerDeliveryJobOfferId, bidderId, bidAmount)
	{
		console.log(`[submitBid] bid of ${bidAmount} submitted by ${bidderId} on ${containerDeliveryJobOfferId}`);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "BidOnContainerDeliveryJobOffer";

		return new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) => {
				return new BidOnContainerDeliveryJobOfferCommand({
					containerDeliveryJobOfferId: containerDeliveryJobOfferId, 
					bidderId: bidderId,
					bidAmount: parseInt(bidAmount)
				}).hydrateTx(tx, factory);
			});
	}

	/**
	 * @param {String} truckerId
	 * @return {Promise} ContainerDeliveryJobOffer[]
	 */
	getContainerDeliveryJobOffersAvailableForTrucker(truckerId)
	{
		// TO-DO: filter according to trucker preferences
		 console.log("[getContainerDeliveryJobOffersAvailableForTrucker] for trucker: " + truckerId);
		 return new LogisticsNetwork().getContainerDeliveryJobOfferAssetRegistry()
		 	 .then((registry) => registry.getAll())
			 .then((rawJobs) => rawJobs.reduce(function(result, rawJob)
			 {
				 let job = new ContainerDeliveryJobOfferForList(rawJob);
				 if(job.status != "INMARKET" || job.canceled)
				 {
					console.log(`Skipping ${job.getContainerDeliveryJobOfferId()}`)
				 }
				 else
				 {
					console.log(`Adding ${job.getContainerDeliveryJobOfferId()}`)
					result.push(job);
				 }
				 return result;
			 }, []));
		
		// let truckerPreferencesPromise = new TruckerService().getTruckerPreferences(truckerId);
		// let registryPromise = new LogisticsNetwork().getContainerDeliveryJobOfferAssetRegistry();
		// return Promise.all([truckerPreferencesPromise, registryPromise])
		// 	.then((values) => 
		// 	{
		// 		return Promise.all([values[0], values[1].getAll()]);
		// 	})
		// 	.then((values) => 
		// 	{
		// 		return values[1].reduce(function(result, rawJob)
		// 		{
		// 			let containerJobOffer = new ContainerDeliveryJobOffer(rawJob);
		// 			if(containerJobOffer.getAvailableForPickupDateTime() >= values[0].availability.from &&
		// 			containerJobOffer.getAvailableForPickupDateTime() <= values[0].availability.to &&
		// 			values[0].getAllowedDestinations().includes(containerJobOffer.getDestination()))
		// 			{
		// 				console.log(`Skipping ${containerJobOffer.getContainerDeliveryJobOfferId()}`)
		// 			}
		// 			else
		// 			{
		// 				console.log(`Adding ${containerJobOffer.getContainerDeliveryJobOfferId()}`)
		// 				result.push(containerJobOffer);
		// 			}
		// 		}, [])
		// 	});
	}
}

module.exports = ContainerDeliveryJobOfferService;