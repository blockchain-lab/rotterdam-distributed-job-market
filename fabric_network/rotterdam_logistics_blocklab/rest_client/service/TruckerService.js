'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const Trucker = require('../domain/Trucker')
const TruckerPreferences = require('../domain/TruckerPreferences');
const TruckerBidOnContainerDeliveryJobOfferForList = require('../domain/TruckerBidOnContainerDeliveryJobOfferForList');

const UpdateTruckerPreferencesCommand = require('../domain/tx/UpdateTruckerPreferencesCommand');
const CreateTruckerCommand = require('../domain/tx/CreateTruckerCommand');

class TruckerService 
{
	/**
		@param {String} TruckerId
		@return {Promise} of a Trucker
	*/
	getTrucker(truckerId) 
	{
		console.log(`[getTrucker] truckerId: ${truckerId}`);

		return new LogisticsNetwork().getTruckerParticipantRegistry()
			.then((truckerParticipantRegistry) => truckerParticipantRegistry.get(truckerId))
			.then((rawTrucker) => new Trucker(rawTrucker));
	}

	/**
		@param {String} TruckerId
		@return {Promise} of a TruckerPreferences
	*/
	getTruckerPreferences(truckerId) 
	{
		return this.getTrucker(truckerId)
			.then((trucker) => trucker.getPreferences());
	}

	/**
		@param {String} TruckerId
		@param {String} TruckCapacity
		@param {DateTime} availableFrom
		@param {DateTime} availableTo
		@param {String[]} allowedDestinations
	*/
	updateTruckerPreferences(truckerId, truckCapacity, availableFrom, availableTo, allowedDestinations) 
	{
		console.log(`[updateTruckerPreferences] updating trucker preferences for ${truckerId} to: ${truckCapacity}`);

		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "UpdateTruckerPreferences";

		return new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) => {
				return new UpdateTruckerPreferencesCommand({
						truckerId: truckerId,
						truckCapacity: truckCapacity
					}).hydrateTx(tx, factory);
			});
	}

	/**
		@param {String} TruckerId
		@return {Promise} of TruckerBidOnContainerJobOffer[]
	*/
	getTruckerBids(truckerId)
	{
		let truckerReference = "resource:nl.tudelft.blockchain.logistics.Trucker#" + truckerId;
		console.log("[getTruckerBids] for trucker: " + truckerId);

		return new LogisticsNetwork().executeNamedQuery('FindAllTruckerBidOnContainerJobOffer', {truckerId: truckerReference})
			.then((assets) => assets.map(x => new TruckerBidOnContainerDeliveryJobOfferForList(x)));
	}

	/**
	 *  Returns the Trucker's rating, but you might just as well use getTrucker
	 *	@param {String} truckerId
	 *	@return {TruckerRating}
	 */
	getRating(truckerId)
	{
		console.log(`[getRating] for trucker: ${truckerId}`);

		return this.getTrucker(truckerId)
			.then((trucker) => trucker.getRating());
	}

	/**
	 * Creates a new Trucker participant on the network
	 * @param {domain.Trucker} trucker - data for the new Trucker participant
	 * @return {Promise} - Trucker is created when promise is fulfilled
	 */
	createTrucker(trucker)
	{
		const namespace = "nl.tudelft.blockchain.logistics";
		return new LogisticsNetwork().createParticipant(
			namespace, 
			"Trucker", 
			trucker.getTruckerId(), 
			(res, factory) => new CreateTruckerCommand(trucker)
				.hydrateTx(res, factory)
		);
	}
}

module.exports = TruckerService;