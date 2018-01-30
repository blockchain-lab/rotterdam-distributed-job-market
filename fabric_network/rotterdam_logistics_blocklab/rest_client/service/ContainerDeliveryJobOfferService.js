'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');
const ContainerDeliveryJobOfferForTrucker = require('../domain/ContainerDeliveryJobOfferForTrucker');
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
	acceptBid(truckerBidId)
	{
		console.log(`[acceptBid] truckerBidId: ${truckerBidId}`);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "AcceptBidOnContainerDeliveryJobOffer";

		return new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) => {
				return new AcceptBidOnContainerDeliveryJobOfferCommand({
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
		console.log(`[cancelBid] truckerBidId: ${truckerBidId}`);

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
	getEligableContainerDeliveryJobOffers(allowedDestinations, availableFrom, availableTo, requiredAdrTraining)
	{	
		let params = {
			availableFrom : availableFrom,
			availableTo : availableTo,
			requiredAdrTraining : requiredAdrTraining
		};

		return new LogisticsNetwork().executeNamedQuery('FindEligableContainerDelivery', params)
			.then((assets) => assets.map(x => new ContainerDeliveryJobOfferForTrucker(x)))
			.then((collection) => collection.filter(x => allowedDestinations.includes(x.destination)));
	}
}

module.exports = ContainerDeliveryJobOfferService;