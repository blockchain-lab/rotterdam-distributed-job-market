'use strict';

class TruckerAvailability
{
	constructor(truckerAvailability)
	{
		this._from = truckerAvailability.from;
		this._to = truckerAvailability.to;
	}

	get from()
	{
		return _from;
	}

	get to()
	{
		return _to;
	}
}

module.exports = TruckerAvailability;