'use strict';

class CreateContainerGuyCommand
{
	constructor(containerGuy)
	{
		this.containerGuy = containerGuy;
	}

	hydrateTx(tx, factory)
	{
		tx.name = this.containerGuy.name;
		return tx;
	}
}

module.exports = CreateContainerGuyCommand;