'use strict';

/**
 * @param {DateTime} availableForPickupDateTime
 * @param {nl.tudelft.blockchain.logistics.TruckerAvailability} truckerAvailability
 */
function isContainerPickupDateTimeWithinTruckerAvailability(availableForPickupDateTime, truckerAvailability)
{
    return truckerAvailability.from <= availableForPickupDateTime && availableForPickupDateTime >= truckerAvailability.to;
}

/**
 * @param {nl.tudelft.blockchain.logistics.AdrTraining} truckerAdrTraining
 * @param {nl.tudelft.blockchain.logistics.AdrTraining} requiredAdrTraining
 */
function isTruckerAdrEligable(truckerAdrTraining, requiredAdrTraining)
{
    return requiredAdrTraining == "NONE" || requiredAdrTraining == truckerAdrTraining;
}

/**
 * @param {nl.tudelft.blockchain.logistics.TruckCapacityType} availableForPickupDateTime
 * @param {nl.tudelft.blockchain.logistics.ContainerSize} containerSize
 */
function isTruckCapacityEligableForContainerSize(truckCapacityType, containerSize)
{
    return (truckCapacityType == containerSize)
            || (truckCapacityType == "TWENTY_TWENTY" && containerSize == "TWENTY");
}

/**
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer
 */
function isTruckerEligableToBidOnJobOffer(trucker, containerDeliveryJobOffer)
{
    // should we check preferences as well?
  
    // currently: just sticking to legal things (ADR && truck capacity)
    var adrEligable = isTruckerAdrEligable(trucker.adrTraining, containerDeliveryJobOffer.requiredAdrTraining);
    var truckCapacityEligable = isTruckCapacityEligableForContainerSize(trucker.truckCapacity, containerDeliveryJobOffer.containerInfo.containerType);
    var withinTruckerPickupAvailability = isContainerPickupDateTimeWithinTruckerAvailability(containerDeliveryJobOffer.availableForPickupDateTime, trucker.availability);

    return adrEligable && truckCapacityEligable && withinTruckerPickupAvailability;
}

/**
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer
 */
function IsTruckerAllowedToAcceptJob(trucker, containerDeliveryJobOffer)
{
    var stillEligableForJobOffer = isTruckerEligableToBidOnJobOffer(trucker, containerDeliveryJobOffer);
    var noConflictingJobsAcceptedPreviously = true; /* TODO: this part */

    /* Future optimization: short-ciruit this */
    return stillEligableForJobOffer && noConflictingJobsAcceptedPreviously;
}

/**
 * Trucker bids on the container
 * @param {nl.tudelft.blockchain.logistics.BidOnContainerDeliveryJobOffer} bidOnContainerDeliveryJobOffer
 * @transaction
 */
function bidOnContainerDeliveryJobOffer(bidOnContainerDeliveryJobOffer)
{
    var factory = getFactory();

    // unpack argument
    var biddingTrucker = bidOnContainerDeliveryJobOffer.bidder;
    var containerDeliveryJobOffer = bidOnContainerDeliveryJobOffer.containerDeliveryJobOffer;

    // Check if job offer is still valid
    if (containerDeliveryJobOffer.canceled || containerDeliveryJobOffer.hasOwnProperty('acceptedContainerBid'))
    {
        return;
    }

    // Check if Trucker is eligable
    // TODO: Would be nice to have this business-rule somewhere "central" for maintenance reasons
    if (!isTruckerEligableToBidOnJobOffer(trucker, containerDeliveryJobOffer))
    {
        // Trucker does not meet criteria
        return;
    }
    
    var newContainerBid = factory.newResource('nl.tudelft.blockchain.logistics', 'TruckerBidOnContainerJobOffer', bidOnContainerDeliveryJobOffer.bidAmount + '_' + biddingTrucker.truckerId + '_' + containerDeliveryJobOffer.containerDeliveryId);
    newContainerBid.bidAmount = bidOnContainerDeliveryJobOffer.bidAmount;
    newContainerBid.bidder = biddingTrucker;

    getAssetRegistry('nl.tudelft.blockchain.logistics.TruckerBidOnContainerJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerBid);
        });
    
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            tx.containerDeliveryJobOffer.containerBids.push(newContainerBid);
            return assetRegistry.update(containerDeliveryJobOffer);
        });
}

/**
* ContainerGuy accepts bid
* @param {nl.tudelft.blockchain.logistics.AcceptBidOnContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
function acceptBidOnContainerDeliveryJobOffer(tx)
{
    tx.containerDeliveryJobOffer.acceptedContainerBid = tx.acceptedContainerBid;
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.containerDeliveryJobOffer);
        });
}

/**
* Cancel delivery
* @param {nl.tudelft.blockchain.logistics.CancelContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
function cancelContainerDeliveryJobOffer(tx)
{
    tx.containerDeliveryJobOffer.canceled = true;
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.containerDeliveryJobOffer);
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
    // containerId is _the_ container Id, we're leaking info here.
    // TODO: obfuscate, maybe hash (with salt?)
    var id = tx.containerInfo.containerId + 'd' + (tx.toBeDeliveredByDateTime).toString(36);
  
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