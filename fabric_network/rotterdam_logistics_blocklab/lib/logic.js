'use strict';

/**
 * Trucker bids on the container
 * @param {nl.tudelft.blockchain.logistics.BidOnContainerDelivery} tx - transaction parameters
 * @transaction
 */
function bidOnContainerDelivery(tx)
{
    if (tx.ContainerDeliveryJobOffer.canceled || tx.ContainerDeliveryJobOffer.hasOwnProperty('acceptedContainerBid'))
    {
        return;
    }
  
    var factory = getFactory();
    var newContainerBid = factory.newResource('nl.tudelft.blockchain.logistics', 'TruckerBidOnContainerJobOffer', tx.bidAmount + '_' + tx.bidder.truckerId + '_' + tx.ContainerDeliveryJobOffer.containerDeliveryId);
    newContainerBid.bidAmount = tx.bidAmount;
    newContainerBid.bidder = tx.bidder;
    getAssetRegistry('nl.tudelft.blockchain.logistics.TruckerBidOnContainerJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerBid);
        });
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            tx.ContainerDeliveryJobOffer.containerBids.push(newContainerBid);
            return assetRegistry.update(tx.ContainerDeliveryJobOffer);
        });
}

/**
* ContainerGuy accepts bid
* @param {nl.tudelft.blockchain.logistics.AcceptBidOnContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
function acceptBidOnContainerDeliveryJobOffer(tx)
{
    tx.ContainerDeliveryJobOffer.acceptedContainerBid = tx.acceptedContainerBid;
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.ContainerDeliveryJobOffer);
        });
}

/**
* Cancel delivery
* @param {nl.tudelft.blockchain.logistics.CancelContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
function cancelContainerDeliveryJobOffer(tx)
{
    tx.ContainerDeliveryJobOffer.canceled = true;
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.ContainerDeliveryJobOffer);
        });
}

/**
* Create container info
* @param {nl.tudelft.blockchain.logistics.CreateContainerInfo} tx - transaction parameters
* @transaction
*/
function createContainerInfo(tx)
{
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
* Create container delivery job offer
* @param {nl.tudelft.blockchain.logistics.CreateContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
function createContainerDeliveryJobOffer(tx)
{
    var id = tx.containerInfo.containerInfoId + 'd' + (tx.toBeDeliveredByDateTime).toString(36);
  
    var newContainerDeliveryJobOffer = getFactory().newResource('nl.tudelft.blockchain.logistics', 'ContainerDeliveryJobOffer', id);
    newContainerDeliveryJobOffer.toBeDeliveredByDateTime = tx.toBeDeliveredByDateTime;
    newContainerDeliveryJobOffer.containerInfo = tx.containerInfo;
    newContainerDelvieryJobOffer.destination = tx.destination;
    newContainerDeliveryJobOffer.containerBids = [];
    newContainerDeliveryJobOffer.status = ContainerDeliveryJobStatus.INMARKET;
  
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerDelivery);
        });
}