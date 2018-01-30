'use strict';


const LogisticsNetwork = require('../connector/LogisticsNetwork');
const ContainerInfo = require('../domain/ContainerInfo');
const ContainerGuy = require('../domain/ContainerGuy');
const Trucker = require('../domain/Trucker');


// TODO: rework to parse a JSON file for the test data and upload to Network
class TestDataProvider
{
	constructor()
	{
		this.guyData = [];
		this.truckerData = [];
		this.containerInfoData = [];
		
		this.guyNumber = 0;	
		this.truckerNumber = 0;
		this.containerInfoNumber = 0;
	
		this.populateTestData();
	}

	populateTestData()
	{
		this.truckerData.push(JSON.parse(
		`{
		  "$class": "nl.tudelft.blockchain.logistics.Trucker",
		  "truckerId": "1",
		  "firstName": "Dick",
		  "lastName": "van der Zee",
		  "adrTraining": "YES",
		  "truckCapacity": "TWENTY",
  		  "rating": {
		    "$class": "nl.tudelft.blockchain.logistics.TruckerRating",
		    "totalPastJobsAccepted": 0,
		    "jobsDelivered": 0
		  }
		}`));

		this.truckerData.push(JSON.parse(
		`{
		  "truckerId": "2",
		  "firstName": "Izak",
		  "lastName": "Lamme",
		  "adrTraining": "YES",
		  "truckCapacity": "FOURTY",
		  "rating": {
		    "totalPastJobsAccepted": 0,
		    "jobsDelivered": 0
		  }
		}`));

		this.guyData.push(JSON.parse(
		`{
			"containerGuyId": "1",
			"name": "ECT Euromax"
		}`));

		this.guyData.push(JSON.parse(
		`{
		  	"containerGuyId": "2",
			"name": "Rotterdam World Gateway Logistics"
		}`));

		this.containerInfoData.push(JSON.parse(
		`{
		  "containerId": "5011",
		  "ownerId": "1",
		  "containerType": "BasicContainer",
		  "containerSize": "TWENTY"
		}`));

		this.containerInfoData.push(JSON.parse(
		`{
		  "containerId": "2",
		  "ownerId": "2",
		  "containerType": "BasicContainer",
		  "containerSize": "TWENTY"
		}`));
	}

	constructNextTestTrucker()
	{
		var trucker = this.truckerData[this.truckerNumber++];
		
		console.log("Initializing Trucker - " + trucker.firstName);

		return new Trucker(trucker);
	}

	constructNextTestContainerGuy()
	{
		var guy = this.guyData[this.guyNumber++];

		console.log("Initializing ContainerGuy - " + guy.name);
		
	    return new ContainerGuy(guy);
	}

	constructNextTestContainerInfo()
	{
		var containerInfo = this.containerInfoData[this.containerInfoNumber++];

		console.log("Initializing ContainerInfo - " + containerInfo.containerId);

		return new ContainerInfo(containerInfo);
	}
}

module.exports = TestDataProvider;