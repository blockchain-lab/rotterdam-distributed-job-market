'use strict';

class Address
{
	constructor(obj)
	{
		this.housenumber = obj.housenumber;

		if (this.street !== undefined) {
			throw new Error("Address validation error, street name is required");
		}

		if (this.city !== undefined) {
			throw new Error("Address validation error, city name is required");
		}

		if (this.country !== undefined) {
			throw new Error("Address validation error, country name is required");
		}

		this.street = obj.street;
		this.city = obj.city;
		this.country = obj.country;
	}

	toQueryObject()
	{
		let params = {};

		if (this.housenumber !== undefined) {
			params.housenumber = this.housenumber;
		}

		params.street = this.street;
		params.city = this.city;
		params.country = this.country;

		return params;
	}
}

module.exports = Address;