The function-level /** */ comment
-----
The /** */ comment is special in the logic.js file. It is used to give the Composer parser some extra meta-data. There are two main bits here, @param part @transaction annotation.

Example:
```
/**
 * Trucker bids on the container
 * @param {nl.tudelft.blockchain.logistics.BidOnContainerDeliveryJobOffer} bidOnContainerDeliveryJobOffer
 * @transaction
 */
function bidOnContainerDeliveryJobOffer(bidOnContainerDeliveryJobOffer) { ... }
```

Read about this at [Transaction Functions](https://hyperledger.github.io/composer/api/api-doc-index.html)

If you did the @param part wrong, you might see the following error in Composer archive command or Playground:
```SyntaxError: Failed to parse null: t.type is null```
I've had this happen when my @param annotation wasn't correct (missing type or missing/wrong param name)