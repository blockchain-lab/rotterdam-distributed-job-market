'use strict';

const config = require('config');
const request = require('request-promise-native');

const Address = require('./model/Address');
const AddressCoordinate = require('./model/AddressCoordinate');

class DistanceService
{
	constructor()
	{
		this.graphhopperApiKey = config["graph-hopper"]["api-key"];
		this.mapquestApiKey = config["mapquest"]["api-key"];
	}

	/**
	 * @param {distance.model.Address}
	 * @return {Integer} - distance to address from some general Port of Rotterdam point, rounded off
	 */
	async determineApproximateDistanceTo(address)
	{
		const addressCoords = await this.determineCoordinatesOfAddress(address);
		const distancePrecise = await this.determineDistanceToCoordinates(addressCoords.getLat(), addressCoords.getLon());

		const processedDistance = this.postProcessDistance(distancePrecise);
		console.log("approx distance: " + processedDistance);
		return processedDistance;
	}

	async determineDistanceToCoordinates(latTo, lonTo)
	{
		const latFrom = 51.9435996;
		const lonFrom = 4.1520646;

		const pointFrom = `${latFrom},${lonFrom}`;
		const pointTo = `${latTo},${lonTo}`;

		const params = {
			point: [pointFrom, pointTo],
			type: 'json',
			key: this.graphhopperApiKey,
			vehicle: "car", // truck not allowed in free tier
			instructions: false, // just the distance
			calc_points: false // just the distance
		}

		const result = await request.defaults({
			uri: `https://graphhopper.com/api/1/route`,
			qs: params,
			headers : {
				accept: 'application/json'
			},
			json: true,
			useQuerystring: true // array serialization -> paint=...&point=...
		}).get();

		if (result == null || result.paths == null || result.paths === undefined || result.paths.length == 0) {
			throw new Error("Could not determine distance to destination, is the address correct?");
		}

		return result.paths[0].distance;
	}

	/**
	 * @param {distance.model.Address} address
	 * @return {Object} - of lon, lat coordinate of the address
	 */
	async determineCoordinatesOfAddress(address)
	{
		const queryObject = address.toQueryObject();
		queryObject.format = "json";
		queryObject.key = this.mapquestApiKey;

		let result = await request.defaults({
			uri: 'http://open.mapquestapi.com/nominatim/v1/search.php',
			qs: queryObject,
			headers : {
				accept: 'application/json'
			},
			json: true
		}).get();

		const addressCoordinate = new AddressCoordinate(result[0]);

		return addressCoordinate;
	}

	postProcessDistance(distance)
	{
		let distanceInKm = this.convertDistanceToKm(distance);

		distanceInKm = this.obfuscateLocationByOvershootingTheDistance(distanceInKm); 

		distanceInKm = this.roundAndDecreasePrecision(distanceInKm);

  		return distanceInKm;
	}

	convertDistanceToKm(distance)
	{
		return distance / 1000;
	}

	roundAndDecreasePrecision(value)
	{
		const precision = -1;
		const factor = Math.pow(10, precision);
  		const roundedOff = Math.round(value * factor) / factor;

  		return roundedOff;
	}

	obfuscateLocationByOvershootingTheDistance(distanceInKm)
	{
		// 5% or not more than 15 km
		const maxOvershoot = Math.min(15, distanceInKm * 1.05);
		const overshootBy = this.getRandomIntInclusive(0, maxOvershoot);

		return distanceInKm + overshootBy
	}

	// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
	getRandomIntInclusive(min, max)
	{
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

module.exports = DistanceService