'use strict';

class SimpleObjectInitializer
{
	static setRequiredValues(arrayRequiredKeys, source, destination)
	{
		let requiredParams = arrayRequiredKeys;
		let destinationTypeName = destination.constructor.name;
		
		for (var i = 0; i < requiredParams.length; i++) {
			let param = requiredParams[i];

			if (source[param] === undefined) {				
				throw new Error(`${destinationTypeName} missing '${param}' field`);
			}

			destination[param] = source[param];
		}
	}
}

module.exports = SimpleObjectInitializer;