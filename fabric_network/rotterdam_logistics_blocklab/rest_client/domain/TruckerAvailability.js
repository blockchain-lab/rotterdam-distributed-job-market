'use strict';

class TruckerAvailability
{
	constructor(truckerAvailability)
	{
		this.from = truckerAvailability.from;
		this.to = truckerAvailability.to;
	}

	get from()
	{
		return this.from;
	}

	get to()
	{
		return this.to;
	}
}