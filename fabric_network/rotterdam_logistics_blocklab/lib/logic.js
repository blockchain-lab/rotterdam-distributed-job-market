'use strict';

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
 *
 * We can image the jobs being not so tight delivery-time wise as this ProofOfConcept and that what we currently see as a "conflict" 
 * is not a conflict in real life. In the future, the decision if the jobs are a conflict can be left to the Trucker. And can be even executed
 * from the Restful-Api-Application. But doing so is considerably more complex as all kinds of race-conditions, business rules, usability
 * and Shipper & Trucker satisfaction must be taken into account. Therefore we KISS'd it and simply cancel every conflict here assuming that
 * pickup-datetime and expected-delivery-datetime and fairly tight (tight enough to not allow the Trucker enough time to deliver,
 * drive back to the Port and pick up some other accepted job on-time before the expected-delivery-datetime of the first job has passed)
 *
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer - the job offer which is being accepted
 * @param {nl.tudelft.blockchain.logistics.Trucker} forTrucker - the Trucker in question
 * @return {Promise} - Promise which when resolved indicates that bids on conflicting offers are canceled
 */
async function cancelTruckersBidsOnConflictingJobOffers(containerDeliveryJobOffer, forTrucker)
{
    // Need to find all the bids of the trucker in the conflictingJobOffers, get the actual asset and then cancel those
    var conflictingJobOffersTruckerHasBidOn = await getAllConflictingJobOffersForTruckerAndJobBeingAccepted(forTrucker, containerDeliveryJobOffer);

    let truckerId = forTrucker.getIdentifier();

    let cancelBidBy = (bidRef, jobOffer) =>
    {
        return getAssetRegistry("nl.tudelft.blockchain.logistics.TruckerBidOnContainerJobOffer")
            .then((registry) => registry.get(bidRef.getIdentifier()))
            .then((bid) => {
                // workaround for RuntimeApi registry not resolving relations
                bid.containerDeliveryJobOffer = jobOffer;
                cancelBid({truckerBid: bid});
            });
    }

    let jobOfferIntoItemsWithBidRefAndJobOffer = (jobOffer) => jobOffer.containerBids.map((bidRef) => {
        return {bidRef: bidRef, correspondingJobOffer: jobOffer};
    });

    let cancelConflictingBidsPromises = conflictingJobOffersTruckerHasBidOn
        // exclude the jobOffer provided in the arguments, don't want to touch that
        .filter((offer) => offer.getIdentifier() != containerDeliveryJobOffer.getIdentifier())
        // map elements to arrays of bids
        // note: need to keep track of the jobOffers as the RuntimeApi registry does not have a 'resolve' method
        .map(jobOfferIntoItemsWithBidRefAndJobOffer)
        // unpack a stream of arrays of items into just a stream of items so that we can use map and simply return promises
        .reduce((accumulator, value) => accumulator.concat(value))
        // hacky: all bids of a tricker share same resource URI prefix, so use that instead of querying and filtering on ID's
        // trucker might have more than one bid on an JobOffer. Also note that we're not dealing with Bid objects, but the refs
        .filter((item) => item.bidRef.getIdentifier().startsWith(truckerId))
        // now cancel each matched bid and collect the promises (on which the TX engine needs to wait)
        .map((item) => cancelBidBy(item.bidRef, item.correspondingJobOffer));

    return Promise.all(cancelConflictingBidsPromises);
}   

/**
 * @param {nl.tudelft.blockchain.logistics.TruckCapacityType} availableForPickupDateTime
 * @param {nl.tudelft.blockchain.logistics.ContainerSize} containerSize
 * @return {boolean} - true if truck capacity can fit the container size
 */
function isTruckCapacityEligableForContainerSize(truckCapacityType, containerSize)
{
    // We support two types: 20, 40
    // Truck is eligable if the capacity is same as size, or the Truck is a 2x20 type while the container is 20
    // note: currently there is no support for a 2x20 truck accepting 2 concurrent jobs
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
async function assertTruckerEligableToBidOnJobOffer(trucker, containerDeliveryJobOffer)
{  
    // currently: just sticking to legal things (ADR && truck capacity)
    var adrEligable = isTruckerAdrEligable(trucker.adrTraining, containerDeliveryJobOffer.requiredAdrTraining);
    if (!adrEligable) {
        throw new Error("adr_not_eligable");
    }

    var truckCapacityEligable = isTruckCapacityEligableForContainerSize(trucker.truckCapacity, containerDeliveryJobOffer.containerInfo.containerSize);
    if (!truckCapacityEligable) {
        throw new Error("truck_capacity_not_eligable");
    }

    var hasConflicts = await hasConflictingAcceptedJobs(trucker, containerDeliveryJobOffer);
    if(hasConflicts) {
        throw new Error("job_conflict");
    }
}

function assertJobOfferIsBiddable(containerDeliveryJobOffer)
{
    // Bidding phase is only when offer is IN MARKET
    let isInMarket = containerDeliveryJobOffer.status == "INMARKET";
    if (!isInMarket) {
        throw new Error("job_not_in_market");
    }

    // is job offer is still valid
    let isCanceled = containerDeliveryJobOffer.canceled;
    if (isCanceled) {
        throw new Error('job_canceled');
    }

    let isAccepted = containerDeliveryJobOffer.hasOwnProperty('acceptedContainerBid')
    if (isAccepted) {
        throw new Error('job_accepted');
    }
}

/**
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker
 * @param {nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer} containerDeliveryJobOffer
 * @return {Promise} - boolean indicating if Trucker is allowed to accept Job Offer
 */
async function isTruckerAllowedToAcceptJob(trucker, containerDeliveryJobOffer)
{
    var hasConflicts = await hasConflictingAcceptedJobs(trucker, containerDeliveryJobOffer);
    return !hasConflicts;
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

    // Check if JobOffer is open for bidding
    assertJobOfferIsBiddable(containerDeliveryJobOffer);

    // Check if Trucker is eligable
    await assertTruckerEligableToBidOnJobOffer(biddingTrucker, containerDeliveryJobOffer);
    
    var bidId = biddingTrucker.truckerId + '_' + containerDeliveryJobOffer.containerDeliveryJobOfferId + '_' + tx.bidAmount;
    var newContainerBid = factory.newResource('nl.tudelft.blockchain.logistics', 'TruckerBidOnContainerJobOffer', bidId);
    newContainerBid.bidAmount = tx.bidAmount;
    newContainerBid.bidder = biddingTrucker;
    newContainerBid.containerDeliveryJobOffer = containerDeliveryJobOffer;

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

async function getContainerDeliveryJobOffer(id)
{
    return getAssetRegistry("nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer")
        then((registry) => registry.get(id));
}

/**
 * Records Trucker getting contracted for a delivery Job
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker - The trucker resource
 * @return {Promise} - of updated Trucker
 */
async function recordAcceptedJobForTruckerRating(trucker)
{
    trucker.rating.totalPastJobsAccepted += 1;
    return updateTrucker(trucker);
}

/**
 * Records the delivery of a Job for Trucker's rating
 * @param {nl.tudelft.blockchain.logistics.Trucker} trucker - The trucker resource
 * @return {Promise} - of updated Trucker
 */
async function recordDeliveredJobForTruckerRating(trucker)
{
    trucker.rating.jobsDelivered += 1;
    return updateTrucker(trucker);
}

/**
* ContainerGuy accepts bid
* @param {nl.tudelft.blockchain.logistics.AcceptBidOnContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
async function acceptBidOnContainerDeliveryJobOffer(tx)
{
    let bid = tx.acceptedBid;
    let containerDeliveryJobOffer = tx.acceptedBid.containerDeliveryJobOffer;

    assertJobOfferIsBiddable(containerDeliveryJobOffer);

    // Ensure Trucker has no conflicts if job is accepted
    let truckerIsAllowedToAcceptJob = isTruckerAllowedToAcceptJob(bid.bidder, containerDeliveryJobOffer);
    if(!(await truckerIsAllowedToAcceptJob)) {
        throw new Error('job_conflict');
    }

    // Cancel Truckers bids on conflicting jobs 
    const cancelBidsOnConflictingJobOffersPromise = cancelTruckersBidsOnConflictingJobOffers(containerDeliveryJobOffer, bid.bidder);

    // Set status of the JobOffer
    containerDeliveryJobOffer.acceptedBid = bid;
    containerDeliveryJobOffer.status = "CONTRACTED";

    // Make the ContainerDeliveryJob asset
    let jobId = containerDeliveryJobOffer.getIdentifier() + '_' + bid.getIdentifier();
    let containerDeliveryJob = getFactory().newResource('nl.tudelft.blockchain.logistics', 'ContainerDeliveryJob', jobId);
    containerDeliveryJob.jobOffer = containerDeliveryJobOffer;
    containerDeliveryJob.contractedTrucker = bid.bidder;
    containerDeliveryJob.availableForPickupDateTime = containerDeliveryJobOffer.availableForPickupDateTime;
    containerDeliveryJob.toBeDeliveredByDateTime = containerDeliveryJobOffer.toBeDeliveredByDateTime;

    // TODO: some mechanism for negotating this. Maybe part of a DH-exchange (to also decrypt other data, also todo)
    containerDeliveryJob.arrivalPassword = "CHANGE_ME";
    containerDeliveryJob.status = "CONTRACTED";

    let truckerRatingUpdatePromise = recordAcceptedJobForTruckerRating(bid.bidder);

    const recordAcceptedBidPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then(function (assetRegistry) {
            return assetRegistry.update(containerDeliveryJobOffer);
        })
        .then (function () {
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
* Cancel job offer -- can only do this when there is no Trucker contracted
* @param {nl.tudelft.blockchain.logistics.CancelContainerDeliveryJobOffer} tx - transaction parameters
* @transaction
*/
function cancelContainerDeliveryJobOffer(tx)
{   
    let jobStatus = tx.ContainerDeliveryJobOffer.status;
    if (jobStatus != "INMARKET" || jobStatus != "NEW") {
        throw new Error("job_not_cancelable");
    }

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
    let factory = getFactory();
    let newContainerInfo = factory.newResource('nl.tudelft.blockchain.logistics', 'ContainerInfo', tx.containerId);
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
    
    // intialize to starting values
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
    if (tx.job.arrivalPassword !== tx.password) {
        // TODO: log who, and count bad attempts to prevent brute-forcing
        throw new Error('delivery_password_incorrect');
    }

    if (tx.job.jobOffer.status != "CONTRACTED") {
        throw new Error('delivery_job_not_contracted');
    }

    tx.job.arrivalDateTime = tx.arrivalDateTime;
    tx.job.jobOffer.status = "DELIVERED";
    tx.job.status = "DELIVERED";

    let updateTruckerRatingPromise = recordDeliveredJobForTruckerRating(tx.job.contractedTrucker);

    let updateDeliveryJobPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJob')
        .then((assetRegistry) => assetRegistry.update(tx.job));

    let updateDeliveryJobOfferPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
        .then((assetRegistry) => assetRegistry.update(tx.job.jobOffer));

    return Promise.all([updateTruckerRatingPromise, updateDeliveryJobPromise, updateDeliveryJobOfferPromise]);
}

/**
 * Udates trucker preferences
 * @param {nl.tudelft.blockchain.logistics.UpdateTruckerPreferences} tx
 * @transaction
 */
function updateTruckerPreferences(tx)
{
    tx.trucker.truckCapacity = tx.truckCapacity;

    return updateTrucker(tx.trucker);
}

/**
 * Cancels truckers bid
 * @param {nl.tudelft.blockchain.logistics.CancelBid} tx
 * @transaction
 */
function cancelBid(tx)
{
    let containerDeliveryJobOffer = tx.truckerBid.containerDeliveryJobOffer;
    let bidId = tx.truckerBid.getIdentifier();

    assertJobOfferIsBiddable(containerDeliveryJobOffer);

    var index = containerDeliveryJobOffer.containerBids.findIndex((value) => value.getIdentifier() == tx.truckerBid.getIdentifier());
    if(index < 0)
    {
        // not found, do nothing
        return Promise.resolve(null);
    }

    containerDeliveryJobOffer.containerBids.splice(index, 1);

    let removeBidFromJobOfferPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.ContainerDeliveryJobOffer')
            .then((assetRegistry) => assetRegistry.update(containerDeliveryJobOffer));

    let removeBidFromAssetRegistryPromise = getAssetRegistry('nl.tudelft.blockchain.logistics.TruckerBidOnContainerJobOffer')
            .then((assetRegistry) => assetRegistry.remove(bidId));

    return Promise.all([removeBidFromAssetRegistryPromise, removeBidFromJobOfferPromise]);
}