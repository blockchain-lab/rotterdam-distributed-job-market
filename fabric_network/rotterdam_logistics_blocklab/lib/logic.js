'use strict';

/**
 * @param {DateTime} availableForPickupDateTime
 * @param {nl.tudelft.blockchain.logistics.TruckerAvailability} truckerAvailability
 */
function isContainerPickupDateTimeWithinTruckerAvailability(availableForPickupDateTime, truckerAvailability)
{
    return truckerAvailability.from <= availableForPickupDateTime && availableForPickupDateTime <= truckerAvailability.to;
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
    var truckCapacityEligable = isTruckCapacityEligableForContainerSize(trucker.truckCapacity, containerDeliveryJobOffer.containerInfo.containerSize);
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
 * @param {nl.tudelft.blockchain.logistics.BidOnContainerDeliveryJobOffer} tx
 * @transaction
 */
function bidOnContainerDeliveryJobOffer(tx)
{
    var factory = getFactory();

    // unpack argument
    var biddingTrucker = tx.bidder;
    var containerDeliveryJobOffer = tx.containerDeliveryJobOffer;

    // Check if job offer is still valid
    if (containerDeliveryJobOffer.canceled || containerDeliveryJobOffer.hasOwnProperty('acceptedContainerBid'))
    {
        throw new Error('Cannot bid on job, job offer is canceled or another trucker has been contracted');
    }

    // Check if Trucker is eligable
    // TODO: Would be nice to have this business-rule somewhere "central" for maintenance reasons
    if (!isTruckerEligableToBidOnJobOffer(biddingTrucker, containerDeliveryJobOffer))
    {
        // Trucker does not meet criteria
        throw new Error('Trucker is not eligable to bid on container delivery job offer');
    }
    
    var bidId =  biddingTrucker.truckerId + '_' + containerDeliveryJobOffer.containerDeliveryJobOfferId + '_' + tx.bidAmount;
    var newContainerBid = factory.newResource('nl.tudelft.blockchain.logistics', 'TruckerBidOnContainerJobOffer', bidId);
    newContainerBid.bidAmount = tx.bidAmount;
    newContainerBid.bidder = biddingTrucker;

    var addNewBidPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.TruckerBidOnContainerJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerBid);
        });
    
    var updateJobOfferPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            tx.containerDeliveryJobOffer.containerBids.push(newContainerBid);
            return assetRegistry.update(containerDeliveryJobOffer);
        });

    return Promise.all([addNewBidPromise, updateJobOfferPromise]);
}

/**
* ContainerGuy accepts bid
* @param {nl.tudelft.blockchain.logistics.AcceptBidOnContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
function acceptBidOnContainerDeliveryJobOffer(tx)
{
    tx.containerDeliveryJobOffer.acceptedBid = tx.acceptedBid;
    tx.containerDeliveryJobOffer.status = "CONTRACTED";

    var jobId = tx.containerDeliveryJobOffer.containerDeliveryJobOfferId + '_' + tx.acceptedBid.truckerBidId;
    var containerDeliveryJob = getFactory().newResource('nl.tudelft.blockchain.logistics', 'ContainerDeliveryJob', jobId);
    containerDeliveryJob.jobOffer = tx.containerDeliveryJobOffer;
    containerDeliveryJob.contractedTrucker = tx.acceptedBid.bidder;

    // TODO: some mechanism for negotating this. Maybe part of a DH-exchange (to also decrypt other data, also todo)
    containerDeliveryJob.arrivalPassword = "CHANGE_ME";

    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.containerDeliveryJobOffer);
        })
        .then (function (result) {
            return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJob');
        })
        .then (function (assetRegistry) {
            return assetRegistry.add(containerDeliveryJob);
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
    var id = tx.containerInfo.containerId + 'ts' + tx.toBeDeliveredByDateTime.getTime();
  
    var newContainerDeliveryJobOffer = getFactory().newResource('nl.tudelft.blockchain.logistics', 'ContainerDeliveryJobOffer', id);
    newContainerDeliveryJobOffer.toBeDeliveredByDateTime = tx.toBeDeliveredByDateTime;
    newContainerDeliveryJobOffer.availableForPickupDateTime = tx.availableForPickupDateTime;
    newContainerDeliveryJobOffer.requiredAdrTraining = tx.requiredAdrTraining;
    newContainerDeliveryJobOffer.containerInfo = tx.containerInfo;
    newContainerDeliveryJobOffer.destination = tx.destination;
    newContainerDeliveryJobOffer.containerBids = [];
    newContainerDeliveryJobOffer.status = "INMARKET";
  
    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.add(newContainerDeliveryJobOffer);
        });
}

/**
 * Accept the delivery of container
 * @param {nl.tudelft.blockchain.logistics.AcceptContainerDelivery} tx
 * @transaction
 */
function acceptContainerDelivery(tx)
{
    //TODO: Raise event w.r.t. the delivery being made (to "ContainerGuy")

    if (tx.job.arrivalPassword !== tx.password) {
        throw new Error('Delivery password is incorrect, cannot accept delivery');
    }

    if (tx.job.jobOffer.status != "CONTRACTED") {
        throw new Error('Cannot mark container delivered, job status is not "contracted"');
    }

    tx.job.arrivalDateTime = tx.arrivalDateTime;
    tx.job.jobOffer.status = "DELIVERED"

    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJob')
        .then(function(assetRegistry) {
            return assetRegistry.update(tx.job);
        })
        .then(function(x) {
            return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer');
        })
        .then(function(assetRegistry) {
            return assetRegistry.update(tx.job.jobOffer);
        });
}