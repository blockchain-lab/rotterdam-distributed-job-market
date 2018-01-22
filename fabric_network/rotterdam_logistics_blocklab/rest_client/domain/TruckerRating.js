'use strict';

class TruckerRating
{
	constructor(obj)
	{
		this.jobsDelivered = obj.jobsDelivered;
		this.totalPastJobsAccepted = obj.totalPastJobsAccepted;
	}
}

module.exports = TruckerRating;