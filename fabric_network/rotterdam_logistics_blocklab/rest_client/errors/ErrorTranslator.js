'use strict';

class ErrorTranslator
{
	constructor()
	{
	}

	/**
	 * Tries translating/mapping the given error into something more human-readable
	 *
	 * @param {Error} error - the error to translate/map/convert
	 * @return {Error} - the translated/mapped/converted error
	 *
	 */
	translate(error)
	{
		let originalMessage = error.message;

		if (originalMessage.includes('[adr_not_eligable]'))
		{
			return new Error("ADR Training level not sufficient to bid on job offer");
		}

		if (originalMessage.includes('[truck_capacity_not_eligable]'))
		{
			return new Error("Truck capacity not eligable for container");
		}

		if (originalMessage.includes('[job_conflict]'))
		{
			return new Error("This job conflicts with (some) of your accepted jobs");
		}

		if (originalMessage.includes('[job_not_in_market]'))
		{
			return new Error("The job is no longer available for bidding");
		}

		if (originalMessage.includes('[job_canceled]'))
		{
			return new Error("The job is not longer available for bidding");
		}

		if (originalMessage.includes('[job_accepted]'))
		{
			return new Error("The job is not longer available for bidding");
		}

		if (originalMessage.includes('[job_not_cancelable]'))
		{
			return new Error("The job cannot be canceled in its current state");
		}

		if (originalMessage.includes('[delivery_password_incorrect]'))
		{
			return new Error("Delivery password is incorrect");
		}

		if (originalMessage.includes('[delivery_job_not_contracted]'))
		{
			return new Error("The job cannot be delivered as it is not in 'contracted' state");
		}

		if (this.messageIsGenericComposerTxError(originalMessage))
		{
			return this.parseGenericChaincodeError(originalMessage);
		}

		// didn't match any
		return error;
	}

	messageIsGenericComposerTxError(message)
	{
		return message.includes('Calling chaincode Invoke()');
	}

	parseGenericChaincodeError(message)
	{
		const regex = /\[Error:(.+)\]/;
		const results = regex.exec(message);

		if (results == null || results.length < 2) {
			// Message does not contain a match on the Error:(.+) group...
			console.log(message);
			console.log(results);
			return new Error(message);
		}

		const extractedTxMessage = results[1];
		return new Error(extractedTxMessage);
	}

}

module.exports = ErrorTranslator;