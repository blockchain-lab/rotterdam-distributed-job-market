var config = require('config');
var LogisticsNetwork = require('../connector/LogisticsNetwork');
var TestMethods = require('./TestMethods');
var ContainerDeliveryJobOfferService = require('../service/ContainerDeliveryJobOfferService');
var ContainerInfoService = require('../service/ContainerInfoService');

class TestService {
	/**
		@param {String} TruckerId
		@return {Promise} of a Trucker
	*/
	runTest() {
		return "success";
	}

	initNetwork(){		
		let methods = new TestMethods();
		let containerInfoService = new ContainerInfoService();
		var containerInfoDeliveryJobService = new ContainerDeliveryJobOfferService();

		let promiseTrucker1 = methods.CreateTrucker('1').catch(() => null);
		let promiseTrucker2 = methods.CreateTrucker('2').catch(() => null);
		let promiseContainerGuy1 = methods.CreateContainerGuy("1").catch(() => null);
		let promiseContainerGuy2 = methods.CreateContainerGuy("2").catch(() => null);

		var cont = `{
		  "$class": "nl.tudelft.blockchain.logistics.ContainerInfo",
		  "containerId": "5011",
		  "ownerId": "1",
		  "containerType": "BasicContainer",
		  "containerSize": "TWENTY"
		}`;
		let promiseContainer1 = containerInfoService.CreateContainerInfo(JSON.parse(cont)).catch(() => null);

		var cont = `{
		  "$class": "nl.tudelft.blockchain.logistics.ContainerInfo",
		  "containerId": "2",
		  "ownerId": "2",
		  "containerType": "BasicContainer",
		  "containerSize": "TWENTY"
		}`;
		let promiseContainer2 = containerInfoService.CreateContainerInfo(JSON.parse(cont)).catch(() => null);

		var data = `{
		  "$class": "nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer",
		  "containerDeliveryJobOfferId": "1249",
		  "containerGuyId": "1",
		  "containerInfoId": "2",
		  "availableForPickupDateTime": "2018-01-15T15:30:21.024Z",
		  "toBeDeliveredByDateTime": "2018-01-20T15:30:21.024Z",
		  "terminalContainerAvailableAt": "",
		  "destination": "Berlin",
		  "requiredAdrTraining": "YES",
		  "containerBids": [],
		  "status": "NEW",
		  "canceled": false
		}`;

		return Promise.all([promiseTrucker1, promiseTrucker2, promiseContainerGuy1, promiseContainerGuy2, promiseContainer1, promiseContainer2])
			.then(() => containerInfoDeliveryJobService.createContainerDeliveryJobOffer(JSON.parse(data)));
	}

	createOffers(){
		var offerService = new ContainerDeliveryJobOfferService();
	}


}

module.exports = TestService;