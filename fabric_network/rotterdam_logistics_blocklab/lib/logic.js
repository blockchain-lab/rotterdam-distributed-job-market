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
 * @param {String} truckerId - id of Trucker participant to check conflicts for
 * @param {DateTime} availableForPickupDateTime - pickup datatime, is the start point of the "overlap"
 * @param {DateTime} toBeDeliveredByDateTime - delivery-by datetime, is the end point of the "overlap"
 * @return {Promise} ContainerDeliveryJob[] - at most 1 container delivery job that is "conflicting" or overlapping with given dateTimes for given trucker
 */
function queryAnyConflictingAcceptedJobsForTrucker(truckerId, availableForPickupDateTime, toBeDeliveredByDateTime)
{
    // querying by relation not directly on the id, hence building the relation-definition string
    var truckerReference = "resource:nl.tudelft.blockchain.logistics.Trucker#" + truckerId;
    return query('FindAnyConflictingAcceptedJobsForTrucker', {
        truckerRef: truckerReference,
        candidateJobPickupDateTime: availableForPickupDateTime,
        candidateJobToBeDeliveredByDateTime: toBeDeliveredByDateTime
    });
}

/**
 * Find all jobOffers that the trucker has bids in, that when accepted, would result in a conflicting ContainerDeliveryJob.
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker - The trucker
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer - the job offer in question
 * @return {Promise} - ContainerDeliveryJobOffer[] that would conflict with Trucker's accepted jobs if accepted
 */
async function getAllConflictingJobOffersForTruckerAndJobBeingAccepted(trucker, containerDeliveryJobOffer)
{
    // first: get all the bids of the trucker
    let truckerRef = trucker.toURI();
    let truckerBids = await query('FindAllTruckerBidOnContainerJobOffer', {truckerId: truckerRef});

    let queryString = 'SELECT nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer' +
        // job must be INMARKET,
        ' WHERE (status =="INMARKET" ' +
        // overlap with the job we have as argument,
        ' AND ((availableForPickupDateTime <= _$candidateJobPickupDateTime AND _$candidateJobPickupDateTime <= toBeDeliveredByDateTime) ' +
        '  OR (availableForPickupDateTime <= _$candidateJobToBeDeliveredByDateTime AND _$candidateJobToBeDeliveredByDateTime <= toBeDeliveredByDateTime) ' + 
        '  OR (_$candidateJobPickupDateTime <= availableForPickupDateTime AND toBeDeliveredByDateTime <= _$candidateJobToBeDeliveredByDateTime)) ';

    // (just trick not to have to skip first OR in the loop below)
    queryString += ' AND (status == "" '; // todo: maybe more efficient to pass in some value and query against 

    // and it must be bid on by the trucker
    truckerBids.forEach((bid) => {
        queryString += " OR (containerBids CONTAINS '" + bid.toURI() + "') ";
    });
    queryString += ")) LIMIT 9999"; // huge limit here, not ideal but if don't specify the default it 25 (as of HLFv1.1)

    return query(buildQuery(queryString), {
        candidateJobPickupDateTime: containerDeliveryJobOffer.availableForPickupDateTime,
        candidateJobToBeDeliveredByDateTime: containerDeliveryJobOffer.toBeDeliveredByDateTime
    });
}

/** 
 * Cancels bids of Trucker on ContainerDeliveryJobOffers that if bid accepted, would result in a job conflict.
 * This is done for sanity and UX reasons as accepting a bid that results in a conflict would throw an error anyway, forcing the
 * shipper/containerGuy to a lot of trial-and-error in a the worst case.
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer - the job offer which is being accepted
 * @param {nl.tudelft.blockchain.logistics.Trucker} forTrucker - the Trucker in question
 * @return {Promise} - Promise which when resolved indicates that bids on conflicting offers are canceled
 */
async function cancelTruckersBidsOnConflictingJobOffers(containerDeliveryJobOffer, forTrucker)
{
    var conflictingJobOffersTruckerHasBidOn = await getAllConflictingJobOffersForTruckerAndJobBeingAccepted(forTrucker, containerDeliveryJobOffer);

    // Need to find all the bids of the trucker in the conflictingJobOffers, get the actual asset and then cancel those
    let truckerId = forTrucker.getIdentifier();

    // first filter exclude the jobOffer provided in the arguments, as it always conflicts with itself and we don't want to cancel that bid
    let toCancel = conflictingJobOffersTruckerHasBidOn.filter((offer) => offer.getIdentifier() != containerDeliveryJobOffer.getIdentifier())
        .map((conflictingOffer) =>
        {
            // hacky: all bids of a tricker share same resource URI prefix, so use that instead of querying and filtering on ID's
            // trucker might have more than one bid on an JobOffer
            let bidsToCancel = conflictingOffer.containerBids.filter((bidRelationship) => bidRelationship.getIdentifier().startsWith(truckerId))
            return {bidsToCancel: bidsToCancel, conflictingOffer: conflictingOffer}
        });

    const cancelConflictingBidsPromises = [];
    toCancel.forEach((offerWithBidsToCancel) =>
        offerWithBidsToCancel.bidsToCancel.forEach((bidToCancel) =>
            cancelConflictingBidsPromises.push(
                getAssetRegistry("nl.tudelft.blockchain.logistics.TruckerBidOnContainerJobOffer")
                    .then((registry) => registry.get(bidToCancel.getIdentifier()))
                    .then((bid) => cancelBid({truckerBid: bid, containerDeliveryJobOffer: offerWithBidsToCancel.conflictingOffer}))
            )
        )
    );

    return Promise.all(cancelConflictingBidsPromises);
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
 * Checks if the containerDeliveryJobOffer given conflicts (time-wise) with previously accepted Jobs
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer
 * @return {Promise} - boolean indicating if Trucker has a conflicting, accepted job
 */
async function hasConflictingAcceptedJobs(trucker, containerDeliveryJobOffer)
{
    var result = await queryAnyConflictingAcceptedJobsForTrucker(
            trucker.getIdentifier(),
            containerDeliveryJobOffer.availableForPickupDateTime,
            containerDeliveryJobOffer.toBeDeliveredByDateTime
        ).then((result) => result.length);

    return result > 0;
}

/**
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer
 * @return {Promise} - of a boolean indicating if Trucker is allowed to bid on Job Offer
 */
async function isTruckerEligableToBidOnJobOffer(trucker, containerDeliveryJobOffer)
{
    // should we check preferences as well?
  
    // currently: just sticking to legal things (ADR && truck capacity)
    var adrEligable = isTruckerAdrEligable(trucker.adrTraining, containerDeliveryJobOffer.requiredAdrTraining);
    if (!adrEligable) {
        throw new Error("adr_not_eligable");
    }

    var truckCapacityEligable = isTruckCapacityEligableForContainerSize(trucker.truckCapacity, containerDeliveryJobOffer.containerInfo.containerSize);
    if (!truckCapacityEligable) {
        throw new Error("truck_capacity_not_eligable");
    }

    var withinTruckerPickupAvailability = isContainerPickupDateTimeWithinTruckerAvailability(containerDeliveryJobOffer.availableForPickupDateTime, trucker.availability);
    if (!withinTruckerPickupAvailability) {
        throw new Error("job_not_within_trucker_availability");
    }

    var hasConflicts = await hasConflictingAcceptedJobs(trucker, containerDeliveryJobOffer);
    if(hasConflicts) {
        throw new Error("job_conflict");
    }

    return adrEligable && truckCapacityEligable && withinTruckerPickupAvailability && !hasConflicts;
}

/**
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer
 * @return {Promise} - boolean indicating if Trucker is allowed to accept Job Offer
 */
async function isTruckerAllowedToAcceptJob(trucker, containerDeliveryJobOffer)
{
    var hasNoConflictingAcceptedJobs = !(await hasConflictingAcceptedJobs(trucker, containerDeliveryJobOffer));
    return hasNoConflictingAcceptedJobs;
}

/**
 * Trucker bids on the container
 * @param {nl.tudelft.blockchain.logistics.BidOnContainerDeliveryJobOffer} tx
 * @transaction
 */
async function bidOnContainerDeliveryJobOffer(tx)
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
    let truckerIsEligibleToBid = await isTruckerEligableToBidOnJobOffer(biddingTrucker, containerDeliveryJobOffer);
    if (!truckerIsEligibleToBid)
    {
        // Trucker does not meet criteria
        throw new Error('Trucker is not eligible to bid on container delivery job offer');
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

async function updateTrucker(trucker)
{
    return getParticipantRegistry("nl.tudelft.blockchain.logistics.Trucker")
        .then((registry) => {
            registry.update(trucker);
        });   
}

/**
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker - The trucker resource
 * @return {Promise} - of updated Trucker
 */
async function recordAcceptedJobForTruckerRating(trucker)
{
    trucker.rating.totalPastJobsAccepted += 1;
    return updateTrucker(trucker);
}

/**
* ContainerGuy accepts bid
* @param {nl.tudelft.blockchain.logistics.AcceptBidOnContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
async function acceptBidOnContainerDeliveryJobOffer(tx)
{
    // Ensure Trucker has no conflicts if job is accepted
    let truckerIsAllowedToAcceptJob = isTruckerAllowedToAcceptJob(tx.acceptedBid.bidder, tx.containerDeliveryJobOffer);
    if(!(await truckerIsAllowedToAcceptJob)) {
        throw new Error('job_conflict');
    }

    // Cancel Truckers bids on conflicting jobs 
    const cancelBidsOnConflictingJobOffersPromise = cancelTruckersBidsOnConflictingJobOffers(tx.containerDeliveryJobOffer, tx.acceptedBid.bidder);

    // Set status of the JobOffer
    tx.containerDeliveryJobOffer.acceptedBid = tx.acceptedBid;
    tx.containerDeliveryJobOffer.status = "CONTRACTED";

    // Make the ContainerDeliveryJob asset
    var jobId = tx.containerDeliveryJobOffer.containerDeliveryJobOfferId + '_' + tx.acceptedBid.truckerBidId;
    var containerDeliveryJob = getFactory().newResource('nl.tudelft.blockchain.logistics', 'ContainerDeliveryJob', jobId);
    containerDeliveryJob.jobOffer = tx.containerDeliveryJobOffer;
    containerDeliveryJob.contractedTrucker = tx.acceptedBid.bidder;
    containerDeliveryJob.availableForPickupDateTime = tx.containerDeliveryJobOffer.availableForPickupDateTime;
    containerDeliveryJob.toBeDeliveredByDateTime = tx.containerDeliveryJobOffer.toBeDeliveredByDateTime;

    // TODO: some mechanism for negotating this. Maybe part of a DH-exchange (to also decrypt other data, also todo)
    containerDeliveryJob.arrivalPassword = "CHANGE_ME";
    containerDeliveryJob.status = "CONTRACTED";

    let truckerRatingUpdatePromise = recordAcceptedJobForTruckerRating(tx.acceptedBid.bidder);

    const recordAcceptedBidPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.containerDeliveryJobOffer);
        })
        .then (function (result) {
            return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJob');
        })
        .then (function (assetRegistry) {
            return assetRegistry.add(containerDeliveryJob);
        });

    // All promises must resolve successfully for this TX to complete
    return Promise.all([cancelBidsOnConflictingJobOffersPromise, recordAcceptedBidPromise, truckerRatingUpdatePromise]);
}

/**
* Trucker Raises Exception
* @param {nl.tudelft.blockchain.logistics.RaiseExceptionOnDeliveryJob} tx - transaction parameters
* @transaction
*/
function RaiseExceptionOnDeliveryJob(tx)
{
    tx.containerDeliveryJob.exception = tx.exception;
    tx.containerDeliveryJob.status = "EXCEPTION";

    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJob')
        .then(function (assetRegistry) {
            return assetRegistry.update(tx.containerDeliveryJob);
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
    newContainerInfo.containerSize = tx.containerSize;
    
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
    newContainerDeliveryJobOffer.terminalContainerAvailableAt = tx.terminalContainerAvailableAt;
    newContainerDeliveryJobOffer.requiredAdrTraining = tx.requiredAdrTraining;
    newContainerDeliveryJobOffer.containerInfo = tx.containerInfo;
    newContainerDeliveryJobOffer.destination = tx.destination;

    newContainerDeliveryJobOffer.containerGuyId = tx.containerInfo.owner.containerGuyId;
    
    // intialize to staring values
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

/**
 * Udates trucker preferences
 * @param {nl.tudelft.blockchain.logistics.UpdateTruckerPreferences} tx
 * @transaction
 */
function updateTruckerPreferences(tx)
{
    tx.trucker.truckCapacity = tx.truckCapacity;
    tx.trucker.availability.from = tx.availableFrom;
    tx.trucker.availability.to = tx.availableTo;
    tx.trucker.allowedDestinations = tx.allowedDestinations;

    return updateTrucker(tx.trucker);
}

/**
 * Cancels truckers bid
 * @param {nl.tudelft.blockchain.logistics.CancelBid} tx
 * @transaction
 */
function cancelBid(tx)
{
    var index = tx.containerDeliveryJobOffer.containerBids.findIndex((value) => value.getIdentifier() == tx.truckerBid.getIdentifier());
    if(index < 0)
    {
        // not found, do nothing
        return Promise.resolve(null);
    }

    tx.containerDeliveryJobOffer.containerBids.splice(index, 1);

    return getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function(assetRegistry) 
        {
            return assetRegistry.update(tx.containerDeliveryJobOffer);
        })
        .then(function(x) 
        {
            return getAssetRegistry('nl.tudelft.blockchain.logistics.TruckerBidOnContainerJobOffer');
        })
        .then(function(assetRegistry) 
        {
            return assetRegistry.remove(tx.truckerBid);
        });
}