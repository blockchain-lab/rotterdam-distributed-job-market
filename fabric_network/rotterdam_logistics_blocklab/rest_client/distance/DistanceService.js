'use strict';

const config = require('config');
const request = require('request-promise-native');

const Address = require('./model/Address');
const AddressCoordinate = require('./model/AddressCoordinate');

class DistanceService
{
	constructor()
	{
		this.apiKey = config["graph-hopper"]["api-key"];
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
		return processedDistance;
	}

	async determineDistanceToCoordinates(latTo, lonTo)
	{
		const latFrom = 51.9435996;
		const lonFrom = 4.1520646;

		let pointFrom = `${latFrom},${lonFrom}`;
		let pointTo = `${latTo},${lonTo}`;

		const params = {
			point: [pointFrom, pointTo],
			type: 'json',
			key: this.apiKey,
			vehicle: "car", // truck not allowed in free tier
			instructions: false, // just the distance
			calc_points: false // just the distance
		}

		let promise = request.defaults({
			uri: `https://graphhopper.com/api/1/route`,
			qs: params,
			headers : {
				accept: 'application/json'
			},
			json: true,
			useQuerystring: true // array serialization -> paint=...&point=...
		}).get();

		const result = await promise;
		console.log(result);
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

		let promise = request.defaults({
			uri: 'https://nominatim.openstreetmap.org/search',
			qs: queryObject,
			headers : {
				accept: 'application/json'
			},
			json: true
		}).get();

		const result = await promise;
		const addressCoordinate = new AddressCoordinate(result[0]);

		return addressCoordinate;
	}

	postProcessDistance(distance)
	{
		const precision = -1;
		let distanceInKm = distance / 100;
		distanceInKm += + distanceInKm * 0.05; // overshoot by 5% to round up a bit

		let factor = Math.pow(10, precision);
  		let roundedOff = Math.round(distanceInKm * factor) / factor;

  		return roundedOff;
	}
}

module.exports = DistanceService