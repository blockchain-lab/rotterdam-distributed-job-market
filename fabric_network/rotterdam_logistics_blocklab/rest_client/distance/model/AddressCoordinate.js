'use strict';

const SimpleObjectInitializer = require('../../util/SimpleObjectInitializer');

class AddressCoordinate
{
	constructor(obj)
	{
		SimpleObjectInitializer.setRequiredValues(['lon', 'lat'], obj, this);
	}

	getLon()
	{
		return this.lon;
	}

	getLat()
	{
		return this.lat;
	}
}

module.exports = AddressCoordinate;