'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const CreateContainerInfoCommand = require('../domain/tx/CreateContainerInfoCommand');

class IdentityService
{
	login(data)
	{
		return LogisticsNetwork.importCardToNetwork(data);
	}

	ping(authorization)
	{
		var cardName = authorization;
	    var logisticsNetwork = new LogisticsNetwork(cardName);

	    return logisticsNetwork.ping();
	}

	logout(authorization)
	{
		var cardName = authorization;
		var logisticsNetwork = new LogisticsNetwork(cardName)
			.logout();
	}
}

module.exports = IdentityService;