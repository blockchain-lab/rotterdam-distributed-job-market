'use strict';

/**
 * Trucker bids on the container
 * @param {nl.tudelft.blockchain.logistics.BidOnContainerDelivery} tx - transaction parameters
 * @transaction
 */
function bidOnContainerDelivery(tx) {
    if (tx.containerDelivery.canceled || tx.containerDelivery.hasOwnProperty('acceptedContainerBid')) {
        return;
    }
    var factory = getFactory();
    var newContainerBid = factory.newResource('nl.tudelft.blockchain.logistics', 'ContainerBid', tx.bid + tx.bidder.truckerId + tx.containerDelivery.containerDevlieryId);
    newContainerBid.bid = tx.bid;
    newContainerBid.bidder = tx.bidder;
    getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerBid')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerBid);
        });
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDelivery')
        .then(function (assetRegistry) {
            tx.containerDelivery.containerBids.push(newContainerBid);
            return assetRegistry.update(tx.containerDelivery);
        });
}

/**
* ContainerGuy accepts bid
* @param {nl.tudelft.blockchain.logistics.AcceptBidOnContainerDelivery} tx - transaction parameters
* @transaction
*/
function acceptBidOnContainerDelivery(tx) {
    tx.containerDelivery.acceptedContainerBid = tx.acceptedContainerBid;
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDelivery')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.containerDelivery);
        });
}

/**
* Cancel delivery
* @param {nl.tudelft.blockchain.logistics.CancelContainerDelivery} tx - transaction parameters
* @transaction
*/
function cancelContainerDelivery(tx) {
    tx.containerDelivery.canceled = true;
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDelivery')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.containerDelivery);
        });
}

/**
* Create container info
* @param {nl.tudelft.blockchain.logistics.CreateContainerInfo} tx - transaction parameters
* @transaction
*/
function createContainerInfo(tx) {
    var factory = getFactory();
    var newContainerInfo = factory.newResource('nl.tudelft.blockchain.logistics', 'ContainerInfo', tx.containerId);
    newContainerInfo.containerType = tx.containerType;
    newContainerInfo.owner = tx.owner;
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerInfo')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerInfo);
        });
}

/**
* Create container delivery
* @param {nl.tudelft.blockchain.logistics.CreateContainerDelivery} tx - transaction parameters
* @transaction
*/
function createContainerDelivery(tx) {
    var factory = getFactory();
    var newContainerDelivery = factory.newResource('nl.tudelft.blockchain.logistics', 'ContainerDelivery', tx.containerInfo.containerInfoId + 'd' + (+tx.containerArrivalTime).toString(36));
    newContainerDelivery.containerArrivalTime = tx.containerArrivalTime;
    newContainerDelivery.containerInfo = tx.containerInfo;
    newContainerDelivery.containerBids = new Array();
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDelivery')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerDelivery);
        });
}