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
		return this.retrieveById(containerDeliveryJobOfferId)
			.then((asset) => asset.getContainerBids());
	}

	/**
	 * @param {String} containerDeliveryJobOfferId
	 * @return {Promise} TruckerBidOnContainerJobOffer[]
	 */
	cancelBid(truckerBidId)
	{
		console.log(`[cancelBid] cancel bid ${truckerBidId} on ${containerDeliveryJobOfferId}`);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "CancelBid";

		return new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) => {
				return new CancelBidCommand({
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
	@param {String[]} allowedDestinations
	@param {Date} availableFrom
	@param {Date} availableTo
	@param {Boolean} requiredAdrTraining
	@return {Promise} of ContainerDeliveryJobOffer[]
	*/
	getEligableContainerDeliveryJobOffer(allowedDestinations, availableFrom, availableTo, requiredAdrTraining)
	{
		let truckerReference = "resource:nl.tudelft.blockchain.logistics.Trucker#" + truckerId;
		console.log("[getTruckerBids] for trucker: " + truckerId);

		return new LogisticsNetwork().executeNamedQuery('FindEligableContainerDelivery', 
				{allowedDestinations: allowedDestinations, availableFrom : availableFrom, availableTo : availableTo, requiredAdrTraining : requiredAdrTraining})
			.then((assets) => assets.map(x => new ContainerDeliveryJobForTrucker(x)));
	}
}

module.exports = ContainerDeliveryJobOfferService;