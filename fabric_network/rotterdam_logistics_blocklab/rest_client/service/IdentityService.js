'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const CreateContainerInfoCommand = require('../domain/tx/CreateContainerInfoCommand');

class IdentityService
{

	Login(data){
		return LogisticsNetwork.importCardToNetwork(data);
	}

	Ping(authorization){
		var cardName = authorization;
	    var logisticsNetwork = new LogisticsNetwork(cardName);

	    return logisticsNetwork.init().then(function () {
	        return logisticsNetwork.Ping();
	    });
	}

	Logout(authorization){
		var cardName = authorization;
		var logisticsNetwork = new LogisticsNetwork(cardName);

	    logisticsNetwork.init().then(function () {
	        return logisticsNetwork.logout();
	    });
	}
}

module.exports = IdentityService;