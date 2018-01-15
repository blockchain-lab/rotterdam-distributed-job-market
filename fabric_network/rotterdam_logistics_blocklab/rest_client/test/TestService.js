var config = require('config');
var LogisticsNetwork = require('../connector/LogisticsNetwork');
var TestMethods = require('./TestMethods');

class TestService {
	/**
		@param {String} TruckerId
		@return {Promise} of a Trucker
	*/
	runTest() {
		console.log("Starting test...");

		const namespace = "nl.tudelft.blockchain.logistics";
		const temp = new LogisticsNetwork().createParticipant(
			namespace, 
			"Trucker", 
			"1", 
			(res, factory) => this.testTrucker(res, factory)
		);
		return temp;
	}

	initNetwork(){		
		var methods = new TestMethods();
		methods.CreateTrucker('1');
		methods.CreateTrucker('2');

		methods.CreateContainerGuy("1");
		methods.CreateContainerGuy("2");

		return "object";
	}


}

module.exports = TestService;