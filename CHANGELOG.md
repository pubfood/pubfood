## Changelog

### v0.2.0 [2016-02-05]

* Bid class documentation missing properties (#33)
* Pubfood constructor configuration documentation (#14)
* `libUri`: Bid provider `libUri` property is optional (#20)
* `doneCallbackOffset`
  * Individual bid provider timeout
    * `pubfood.doneCallbackOffset(millis);`
    * `BidProvider.timeout(millis);`
    * `BidProvider.getTimeout();`
* **Bid provider default targeting key**
  * disable bid provider default targeting key or key prefix (#16)
    1. _**Omit entirely**_ the bid provider default targeting key:
      `pubfood.omitDefaultBidKey(boolean)`
    2. Turn off the bid provider name prefix from the default targeting key.
      Most relevant if you are using the [label](src/model/bid.js#L30) property when pushing a bid.
      `pubfood.prefixDefaultBidKey(boolean)`
* **Examples**
  * [AOL bid provider](examples/provider/bid/aol/marketplace-ex1.html)
  * [Yieldbot bid provider](examples/provider/bid/yieldbot/yieldbot-ex1.html)

### v0.1.14 [2016-01-22]

* Refactor usage of in operator iterating arrays (#28)

### v0.1.13 [2016-01-12]

* **[DEPRECATED]** TargetingObject property type: `[ 'slot' | 'page' ]`
  * slot-level targeting is identified by the existence of a `name` property on
    the targeting object instances in the array passed into `AuctionProvider.init(array.<targeting>, done)`
    and `AuctionProvider.refresh(array.<targeting>, done)`
* Auction refresh started prematurely (#21)
* Page-level bidding (#19)
* Bid providers can be added, but set to enabled(false) status so that the
  provider will not be included in bidding for the auction
  * `BidProvider.enabled([true|false])`
  * All bid providers are enabled by default
* Refresh slot names optional, `pubfood.refresh([slotNames])`, the `slotNames`
  argument is optional. If slot names are not provided, all added slots will be refreshed
* Added event, `Event.EVENT_TYPE.PUBFOOD_API_REFRESH`
  * Event emitted on call to `pubfood.refresh(...)`
* Added event, `Event.EVENT_TYPE.BID_PUSH_NEXT_LATE`
  * Event emitted when bid provider calls `pushBid` after the auction timeout
* Event object property auctionId added, PubfoodEvent.auctionId e.g. ij622hshjq1k87lh5v:1
  * Before first auction, <id>:0 i.e. pubfood library setup events
  * First auction, <id>:1
  * Second auction, <id>:2
  * Third auction, <id>:3
  * ...
* `logger.logCall` and `logger.logEvent` data structures. This change is only
  relevant to you if you redefine console.log and use the logged data structures.
  If you are doing this, I'd recommend using pubfood.observe() to set an event listener:
  * `logEvent auction => auctionId, args => event` `{ts: auctionId: eventName: event:}`
  * `logCall auction => auctionId` `{ts: auctionId: functionName: event:}`
* Dump log filter, pubfood.dumpLog(regexString) e.g.
```
pf.dumpLog('START|COMPLETE')
Object {ts: 1452280090830, auctionId: "ij622hshjq1k87lh5v:1", eventName: "PUBFOOD_API_START", event: Object}
Object {ts: 1452280090848, auctionId: "ij622hshjq1k87lh5v:1", eventName: "BID_START", event: Object}
Object {ts: 1452280090864, auctionId: "ij622hshjq1k87lh5v:1", eventName: "BID_START", event: Object}
Object {ts: 1452280090866, auctionId: "ij622hshjq1k87lh5v:1", eventName: "BID_COMPLETE", event: Object}
Object {ts: 1452280090887, auctionId: "ij622hshjq1k87lh5v:1", eventName: "AUCTION_START", event: Object}
Object {ts: 1452280091053, auctionId: "ij622hshjq1k87lh5v:1", eventName: "BID_COMPLETE", event: Object}
```

### v0.1.12 [2016-01-04]

* Custom slot and provider parameters (#17, #6)
* Flush immediate event observers (#10)

### v0.1.11 [2015-11-23]

* BidProvider not allocated to a slot always starts auction by timeout (#9)

### v0.1.10 [2015-11-18]

* Make implementation of refresh on providers optional (#5)
* Use unbiased randomization (#7)
* Event replay handling (#4)
* Use slice in preference to splice (d039095)
* Annotate internal doc as private (3004dc7, 124090f)
* Moved standalone to the examples (815e0b9)

### v0.1.9 [2015-11-12]

* Allow Bid values to be a numeric zero 0 or an empty string '' (#1)

### v0.1.1 [2015-10-28]

* Initial release