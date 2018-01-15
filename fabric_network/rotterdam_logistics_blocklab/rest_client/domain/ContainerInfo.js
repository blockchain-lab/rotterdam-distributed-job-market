'use strict';

class ContainerInfo
{
	constructor(obj)
	{
		this.ownerId = obj.ownerId;
		this.containerSize = obj.containerSize;
		this.containerType = obj.containerType;
	}

	getOwnerId()
	{
		return ownerId;
	}

	getContainerSize()
	{
		return containerSize;
	}

	getContainerType()
	{
		return containerType;
	}

	getContainerId()
	{
		return containerId;
	}
}

module.exports = ContainerInfo;