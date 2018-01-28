
var LogisticsNetwork = require('../connector/LogisticsNetwork');


// TODO: rework to parse a JSON file for the test data and upload to Network
class TestMethods
{
	constructor()
	{
		this.guyData = [];
		this.truckerData = [];
		
		this.guyNumber = 0;	
		this.truckerNumber = 0;		
	
		this.truckerData.push(JSON.parse(
		`{
		  "$class": "nl.tudelft.blockchain.logistics.Trucker",
		  "truckerId": "T01",
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
		  "$class": "nl.tudelft.blockchain.logistics.Trucker",
		  "truckerId": "T02",
		  "firstName": "Izak",
		  "lastName": "Lamme",
		  "adrTraining": "YES",
		  "truckCapacity": "FOURTY",
		  "rating": {
		    "$class": "nl.tudelft.blockchain.logistics.TruckerRating",
		    "totalPastJobsAccepted": 0,
		    "jobsDelivered": 0
		  }
		}`));

		this.guyData.push(JSON.parse(
		`{
			"$class": "nl.tudelft.blockchain.logistics.ContainerGuy",
			"containerGuyId": "CTG01",
			"name": "ECT Euromax"
		}`));

		this.guyData.push(JSON.parse(
		`{
			  "$class": "nl.tudelft.blockchain.logistics.ContainerGuy",
			  "containerGuyId": "CTG02",
			  "name": "Rotterdam World Gateway Logistics"
		}`));
	}

	constructTestTrucker(resource, factory)
	{
		var trucker = this.truckerData[this.truckerNumber++];
		
		console.log("Initializing Trucker - " + trucker.firstName);

		resource.firstName = trucker.firstName;
		resource.lastName = trucker.lastName;
		resource.adrTraining = trucker.adrTraining;
		resource.truckCapacity = trucker.truckCapacity;

		resource.rating = factory.newConcept("nl.tudelft.blockchain.logistics", "TruckerRating");
		resource.rating.jobsDelivered = trucker.rating.jobsDelivered;
		resource.rating.totalPastJobsAccepted = trucker.rating.totalPastJobsAccepted;
		
	    return resource;
	}

	constructTestContainerGuy(resource, factory)
	{
		var guy = this.guyData[this.guyNumber++];

		console.log("Initializing ContainerGuy - " + guy.name);
		
		resource.name = guy.name;
	    return resource;
	}


	CreateTrucker(truckerId){
		const namespace = "nl.tudelft.blockchain.logistics";
		const promise = new LogisticsNetwork().createParticipant(
			namespace, 
			"Trucker", 
			truckerId, 
			(res, factory) => this.constructTestTrucker(res, factory)
		);
		return promise;
	}

	CreateContainerGuy(containerGuyId){
		const namespace = "nl.tudelft.blockchain.logistics";
		const promise = new LogisticsNetwork().createParticipant(
			namespace, 
			"ContainerGuy", 
			containerGuyId, 
			(res, factory) => this.constructTestContainerGuy(res, factory)
		);
		return promise;
	}
}

module.exports = TestMethods;