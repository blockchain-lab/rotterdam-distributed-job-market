'use strict';

const SimpleObjectInitializer = require('../../util/SimpleObjectInitializer');

class Address
{
	constructor(obj)
	{
		const required = ["street", "city", "country"];
		SimpleObjectInitializer.setRequiredValues(required, obj, this);

		// is optional, can be undefined
		this.housenumber = obj.housenumber;
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