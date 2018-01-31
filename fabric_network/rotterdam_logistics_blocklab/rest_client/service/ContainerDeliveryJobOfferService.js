'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');
const SimpleObjectInitializer = require('../util/SimpleObjectInitializer');
const EscapeStringRegexp = require('escape-string-regexp');

const DistanceService = require('../distance/DistanceService');
const Address = require('../distance/model/Address');

const AcceptBidOnContainerDeliveryJobOfferCommand = require('../domain/tx/AcceptBidOnContainerDeliveryJobOfferCommand');
const BidOnContainerDeliveryJobOfferCommand = require('../domain/tx/BidOnContainerDeliveryJobOfferCommand');
const CancelBidCommand = require('../domain/tx/CancelBidCommand');
const CreateContainerDeliveryJobOfferCommand = require('../domain/tx/CreateContainerDeliveryJobOfferCommand');

const ContainerDeliveryJobOffer = require('../domain/ContainerDeliveryJobOffer');
const ContainerDeliveryJobOfferForList = require('../domain/ContainerDeliveryJobOfferForList');
const ContainerDeliveryJobOfferForTrucker = require('../domain/ContainerDeliveryJobOfferForTrucker');


class ContainerDeliveryJobOfferService
{
	constructor(distanceService)
	{
		// support dependency injection of DistanceService (distance determination costs credits)
		this.distanceService = distanceService === undefined ? new DistanceService() : distanceService;
	}

	/** TODO: expand argument into arguments
	 * @param {CTO object of CreateContainerDeliveryJobOffer} createContainerDeliveryJobOffer
	 */
	async createContainerDeliveryJobOffer(createContainerDeliveryJobOffer)
	{
		console.log("[createContainerDeliveryJobOffer] for containerInfoId: " + createContainerDeliveryJobOffer.containerInfoId);

		const destinationAddress = new Address({
			housenumber: createContainerDeliveryJobOffer.destination.housenumber,
			street: createContainerDeliveryJobOffer.destination.street,
			city: createContainerDeliveryJobOffer.destination.city,
			country: createContainerDeliveryJobOffer.destination.country
		});

		let approxDistanceToDestination = await this.distanceService.determineApproximateDistanceTo(destinationAddress);
		createContainerDeliveryJobOffer.approxDistanceToDestination = approxDistanceToDestination;

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
	getEligableContainerDeliveryJobOffers(allowedDestinations, availableFrom, availableTo, requiredAdrTraining, maxDistanceToDestination)
	{	
		const params = {
			availableFrom : availableFrom,
			availableTo : availableTo,
			requiredAdrTraining : requiredAdrTraining,
			maxDistanceToDestination: maxDistanceToDestination
		};

		const anyDestinationAllowed = allowedDestinations.length == 0;
		
		const filterDestinations = (item) => {
			if (anyDestinationAllowed) {
				return true;
			}

			let itemHasAllowedDestination = allowedDestinations.some((allowedDestination) => -1 != item.destination.search(EscapeStringRegexp(allowedDestination)));
			return itemHasAllowedDestination;
		} 

		return new LogisticsNetwork().executeNamedQuery('FindEligableContainerDeliveryJobOffers', params)
			.then((assets) => assets.map(x => new ContainerDeliveryJobOfferForTrucker(x)))
			.then((collection) => collection.filter(filterDestinations));
	}
}

module.exports = ContainerDeliveryJobOfferService;