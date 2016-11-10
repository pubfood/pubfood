# Changelog

## v1.0.0 [2016-11-10]

### Breaking Changes
* Annotate provider complete events if forced by pubfood ([3794834](https://github.com/pubfood/pubfood/commit/37948344d3edeb33e07f5f116717cc940d443f72), [#48](https://github.com/pubfood/pubfood/issues/48))
_The_ `EventObject.eventContext` is replaced with [EventObject.annotations](https://github.com/pubfood/pubfood/blob/master/src/interfaces.js#L197).
 * [Forced Done Event Annotation](https://github.com/pubfood/pubfood/blob/master/examples/provider/general/forceddoneproviderevents.md)
 * [Example - forceddoneproviderevents.html](https://github.com/pubfood/pubfood/blob/master/examples/provider/general/forceddoneproviderevents.html)

* wrap provider calls in try/catch ([bdce947](https://github.com/pubfood/pubfood/commit/bdce947bed745bcc62f19b323549148147aae787), [#60](https://github.com/pubfood/pubfood/issues/60))
_Errors_ thrown in implementations of BidProvider and AuctionProvider `init` or `refresh` functions will be caught by default. Use `pubfood.throwErrors(true)` to have Errors re-thrown if your error handling logic is expected to log or handle the Errors.
 * [Catch Provider Errors](https://github.com/pubfood/pubfood/blob/master/examples/provider/general/catchprovidererrors.md)
 * [Example - catchprovidererrors.html](https://github.com/pubfood/pubfood/blob/master/examples/provider/general/catchprovidererrors.html)

### Features
* Project and release artifacts ([d7d4da9](https://github.com/pubfood/pubfood/commit/d7d4da945258b782dda75d629cfdc7bafedefb4d), [#62](https://github.com/pubfood/pubfood/pull/62)
 * Updates to org repo doc, management and release process artifacts.
* expose auction run and callback offset ([7c2e00a](https://github.com/pubfood/pubfood/commit/7c2e00ad952c362879d22c8133864b6296d3ce4c), [#49](https://github.com/pubfood/pubfood/issues/49))
* Google Analytics User Timings integration example ([01fdf12](https://github.com/pubfood/pubfood/commit/01fdf127e560995664f8ac65a7b7758c65fc8dcf), [#46](https://github.com/pubfood/pubfood/issues/46))

### Fixes
* IndexExchange index_render function definition ([28c1c71](https://github.com/pubfood/pubfood/commit/28c1c716303fc459a82224cb756c07c4980ae986), [#66](https://github.com/pubfood/pubfood/issues/66))
* value and sizes not required for page-level bid ([0ccf631](https://github.com/pubfood/pubfood/commit/0ccf6316961de0de091fcf264f89e73cf06d92b0), [#64](https://github.com/pubfood/pubfood/issues/64))
* synchronous load of BidDelegate.libUri ([a23981d](https://github.com/pubfood/pubfood/commit/a23981dc52f50013360be96e82257221f4a0af39), [#63](https://github.com/pubfood/pubfood/issues/63))
* rename reserved word - extends ([3ba659b](https://github.com/pubfood/pubfood/commit/3ba659b1c0f8340cff896e0c330937a3c0545cb3), [#61](https://github.com/pubfood/pubfood/issues/61))
* Fixes #52, Sinon.js patch update produces build failure ([83e042b](https://github.com/pubfood/pubfood/commit/83e042ba54b1bf8e9c86e4e1c7b012b48673695a), [#52](https://github.com/pubfood/pubfood/issues/52))
* allow numeric zero as bid value ([f3817e4](https://github.com/pubfood/pubfood/commit/f3817e4d91f3dfbebb383b0a87ebca11242651a4), [#41](https://github.com/pubfood/pubfood/issues/41))



## v0.2.0 [2016-02-05]
### Features
* `libUri`: Bid provider `libUri` property is optional ([dbf883d](https://github.com/pubfood/pubfood/commit/dbf883dd5ac91dcb2b74c0a6789d9ebcea80f93c), [#20](https://github.com/pubfood/pubfood/issues/20))
* `doneCallbackOffset`
  * Individual bid provider timeout
    * `pubfood.doneCallbackOffset(millis);`
    * `BidProvider.timeout(millis);`
    * `BidProvider.getTimeout();`
* **Bid provider default targeting key**
  * disable bid provider default targeting key or key prefix ([30f23d2](https://github.com/pubfood/pubfood/commit/30f23d2f57f014f47490dbe7b48cf3858df181e9), [#16](https://github.com/pubfood/pubfood/issues/16))
    1. _**Omit entirely**_ the bid provider default targeting key:
      `pubfood.omitDefaultBidKey(boolean)`
    2. Turn off the bid provider name prefix from the default targeting key.
      Most relevant if you are using the [label](src/model/bid.js#L30) property when pushing a bid.
      `pubfood.prefixDefaultBidKey(boolean)`
* **Examples**
  * [AOL bid provider](examples/provider/bid/aol/marketplace-ex1.html)
  * [Yieldbot bid provider](examples/provider/bid/yieldbot/yieldbot-ex1.html)

### Fixes
* Bid class documentation missing properties ([51749b0](https://github.com/pubfood/pubfood/commit/51749b00ce0748164274443c2e6e2e7dca2e7b6d), [#33](https://github.com/pubfood/pubfood/issues/33))
* Pubfood constructor configuration documentation ([a8f8db8](https://github.com/pubfood/pubfood/commit/a8f8db8917b8581ce091fd02e6ae2d269f2c74ff), [#14](https://github.com/pubfood/pubfood/issues/14)}

## v0.1.14 [2016-01-22]
### Fixes
* Refactor usage of in operator iterating arrays  ([30f23d2](https://github.com/pubfood/pubfood/commit/30f23d2f57f014f47490dbe7b48cf3858df181e9), [#28](https://github.com/pubfood/pubfood/issues/16))

## v0.1.13 [2016-01-12]
### Features
* **[DEPRECATED]** TargetingObject property type: `[ 'slot' | 'page' ]`
  * slot-level targeting is identified by the existence of a `name` property on
    the targeting object instances in the array passed into `AuctionProvider.init(array.<targeting>, done)`
    and `AuctionProvider.refresh(array.<targeting>, done)`

* Page-level bidding ([adc9170](https://github.com/pubfood/pubfood/commit/adc91701c8304e73b0001d8df3b810f16688a58c), [#19](https://github.com/pubfood/pubfood/issues/19))
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
### Fixes
* Auction refresh started prematurely ([03ea7cc](https://github.com/pubfood/pubfood/commit/03ea7cc9554422cf7bb7030fee25301e4b80f07a), [#21](https://github.com/pubfood/pubfood/issues/21))

## v0.1.12 [2016-01-04]
### Features
* Custom slot and provider parameters ([8cc2d51](https://github.com/pubfood/pubfood/commit/8cc2d51e54416e344ec2231fb38e509c5873abd3), [#6](https://github.com/pubfood/pubfood/issues/6), [#17](https://github.com/pubfood/pubfood/issues/17))

### Fixes
* Flush immediate event observers ([cde15d4](https://github.com/pubfood/pubfood/commit/cde15d49610cc24e6798c5188bbb040ea2849461), [#10](https://github.com/pubfood/pubfood/issues/10))

## v0.1.11 [2015-11-23]
### Fixes
* BidProvider not allocated to a slot always starts auction by timeout ([54cec89](https://github.com/pubfood/pubfood/commit/54cec89a0fe2488d52457ac07da9d246470a965b), [#9](https://github.com/pubfood/pubfood/issues/9))

## v0.1.10 [2015-11-18]
### Features
* Make implementation of refresh on providers optional ([f4344e3](https://github.com/pubfood/pubfood/commit/f4344e30a1ff2cd07dfc63e33c06a3822aee045d), [#5](https://github.com/pubfood/pubfood/issues/5))
* Use slice in preference to splice ([d039095](https://github.com/pubfood/pubfood/commit/d0390951404eb52be9b4fae0e304bdc069b26494))
* Annotate internal doc as private ([3004dc7](https://github.com/pubfood/pubfood/commit/3004dc746e44498dc6879cbfd12126886d1ea6bb), [124090f](https://github.com/pubfood/pubfood/commit/124090f74168bfe1a0476ee1e8f996b2d0e95654))
* Moved standalone to the examples ([815e0b9](https://github.com/pubfood/pubfood/commit/815e0b973e474570cd6c405278e2993333101d7f))

### Fixes
* Use unbiased randomization ([952ab14](https://github.com/pubfood/pubfood/commit/952ab148862c6f19b49a55c962aa12d08683bbbf), [#7](https://github.com/pubfood/pubfood/issues/7))
* Event replay handling  ([a935816](https://github.com/pubfood/pubfood/commit/a935816695dd08b435497b952ec637ea7cef3e42), [#4](https://github.com/pubfood/pubfood/issues/4))

## v0.1.9 [2015-11-12]
### FIxes
* Allow Bid values to be a numeric zero 0 or an empty string `''` ([919e199](https://github.com/pubfood/pubfood/commit/919e199fca08beed0565ccf7712c3fe731d7fcb6), [#1](https://github.com/pubfood/pubfood/issues/1))

## v0.1.1 [2015-10-28]

* Initial release