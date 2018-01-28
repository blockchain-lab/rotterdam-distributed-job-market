'use strict';

class ContainerGuy
{
	constructor(obj)
	{
		this.containerGuyId = obj.containerGuyId;
		this.name = obj.name;
	}

	getContainerGuyId()
	{
		return this.containerGuyId;
	}

	getName()
	{
		return this.name;
	}
}

module.exports = ContainerGuy;