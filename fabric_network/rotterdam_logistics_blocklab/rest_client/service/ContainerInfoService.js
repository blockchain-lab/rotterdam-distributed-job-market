'use strict';

const config = require('config');
const LogisticsNetwork = require('../connector/LogisticsNetwork');

const CreateContainerInfoCommand = require('../domain/tx/CreateContainerInfoCommand');

class ContainerInfoService
{
	createContainerInfo(containerInfo)
	{
		const namespace = "nl.tudelft.blockchain.logistics";
		const txName = "CreateContainerInfo";

		const txExecutedPromise = new LogisticsNetwork().submitTransaction(
			namespace,
			txName,
			(tx, factory) =>  {
				return new CreateContainerInfoCommand(containerInfo)
					.hydrateTx(tx, factory)
			}
		);

		return txExecutedPromise;
	}
}

module.exports = ContainerInfoService;