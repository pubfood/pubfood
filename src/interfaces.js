/**
 * pubfood
 */

'use strict';

/*eslint no-unused-vars: 0*/

/** @namespace typeDefs */

/**
 * Interface for classes that are delegates for the AuctionProvider decorator..
 *
 * @typedef {AuctionDelegate} AuctionDelegate
 * @property {string} name Auction provider delegate name
 * @property {string} libUri
 * @property {function} init Auction provider delegate initial auction request.<br>Called at startup.
 * @property {array.<TargetingObject>} init.targeting
 * @property {auctionDoneCallback} init.done Callback to execute on done
 * @property {function} [refresh] Auction provider delegate refresh auction request.<br>Called at startup.
 * @property {array.<TargetingObject>} refresh.targeting
 * @property {auctionDoneCallback} refresh.done Callback to execute on done
 * @property {function} [trigger] Auction provider delegate function to trigger the auction. Default: [pubfood.timeout]{@link pubfood#timeout}
 * @property {auctionDoneCallback} trigger.done Callback to initialize the auction provider
 * @memberof typeDefs
 */
var auctionDelegate = {
  name: '',
  libUri: '',
  timeout: 0,
  init: function(targeting, done) {},
  refresh: function(targeting, done) {}
};
auctionDelegate.optional = {
  refresh: true,
  timeout: true
};

/**
 * Interface for classes that are delegates for the BidProvider decorator.
 *
 * @typedef {BidDelegate} BidDelegate
 * @property {string} name Bid provider delegate name.
 * @property {string} [libUri] location of the delegate JavaScript library/tag.
 * @property {function} init Initial bid request for [BidProvider.init]{@link pubfood#provider.BidProvider#init} delegate.
 * @property {Slot[]} init.slots slots to bid on
 * @property {pushBidCallback} init.pushBid Callback to execute on next bid available
 * @property {bidDoneCallback} init.done Callback to execute on done
 * @property {function} [refresh] Refresh bids for [BidProvider.refresh]{@link pubfood#provider.BidProvider#refresh} delegate.
 * @property {Slot[]} refresh.slots slots to bid on
 * @property {pushBidCallback} refresh.pushBid Callback to execute on next bid available
 * @property {bidDoneCallback} refresh.done Callback to execute on done
 * @memberof typeDefs
 */
var bidDelegate = {
  name: '__default__',
  libUri: ' ',
  timeout: 0,
  init: function(slots, pushBid, done) {
    done();
  },
  refresh: function(slots, pushBid, done) {
    done();
  }
};
bidDelegate.optional = {
  libUri: true,
  refresh: true,
  timeout: true
};

/**
 * Function delegates for the [TransformOperator]{@link pubfood#assembler.TransformOperator} decorator.
 * @typedef {function} TransformDelegate
 * @param {Bid[]} bids array of bids to transform
 * @param {object} params parameters as required by delegate function. Future use.
 * @returns {Bid[]|null}
 * @example
 *   var transformDelegate = function(bids, params) { console.log('operate on bids'); };
 * @memberof typeDefs
 */
var transformDelegate = function(bids, params) {
};

/**
 * Auction trigger function.
 *
 * A custom function that can be registered with an [AuctionMediator]{@link pubfood#mediator.AuctionMediator} that
 * will determine when the publisher ad server request should be initiated.
 *
 * The [start]{@link startAuctionCallback} callback must be invoked to start the auction.
 *
 * @typedef {function} AuctionTriggerFn
 * @param {startAuctionCallback} start callback to initiate the publisher ad server request
 * @memberof typeDefs
 */
var auctionTriggerFunction = function(startAuctionCallback) {
};

/**
 * Start Publisher Ad Server auction request callback.
 *
 * This is the callback passed into the {@link AuctionTriggerFn}.
 *
 * @typedef {function} startAuctionCallback
 * @memberof typeDefs
 */

/**
 * Callback to notify of [BidProvider]{@link pubfood#provider.BidProvider} has its completed bidding process.
 *
 * @typedef {function} bidDoneCallback
 * @fires PubfoodEvent.BID_COMPLETE
 * @memberof typeDefs
 */
var bidDoneCallback = function(){

};

/**
 * Publisher ad server request processing is done.
 *
 * @typedef {function} auctionDoneCallback
 * @fires PubfoodEvent.AUCTION_COMPLETE
 * @memberof typeDefs
 */
var auctionDoneCallback = function(){

};


/**
 * Callback to push bids into the list for publisher ad server auction.
 * @typedef {function} pushBidCallback
 * @param {BidObject} bid the bid object
 * @fires PubfoodEvent.BID_PUSH_NEXT
 * @memberof typeDefs
 */
var pushBidCallback = function(bid){

};

/**
 * Custom reporter.
 * A function that handles reporting of [PubfoodEvent]{@link PubfoodEvent} objects
 * @typedef {function} reporter
 * @param {PubfoodEvent} event the event object
 * @memberof typeDefs
 */
var reporter = function(event){

};

/**
 * Provides information about configuration at start
 *
 * @typedef {function} apiStartCallback
 * @param {boolean} hasErrors true if there are any configuration errors
 * @param {array} errors The list of errors
 * @memberof typeDefs
 */
var apiStartCallback = function(hasErrors, errors){

};

/**
 * Bid object structure for the {@link pushBidCallback}.
 *
 * @typedef {BidObject} BidObject
 * @property {string} [slot] - slot name
 * @property {string} [value] - publisher adserver targeting bid value. Default: empty string.
 * @property {array.array.<number, number>} [sizes] - array of sizes for the slot the bid is for
 * @property {number} sizes.0 width
 * @property {number} sizes.1 height
 * @property {object} [targeting] - key/value pairs for additional adserver targeting
 * @property {string} [label] optional targeting key to use for bid value
 * @memberof typeDefs
 */
var bidObject = {
  slot: '',
  value: '',
  sizes: [],
  targeting: {},
  label: ''
};

/**
 * Event object structure for [observed]{@link pubfood#observe} events.
 *
 * @typedef {EventObject} EventObject
 * @property {string} auctionId the auction identifier
 * @example AuctionId Format - <random string>:<auction count index>
 * iis9xx46a6v2x58e1b:3
 * @property {string} ts the event timestamp
 * @property {PubfoodEvent#EVENT_TYPE} type the event type
 * @property {object|string} data the data payload for the [EVENT_TYPE]{@link PubfoodEvent#EVENT_TYPE}
 * @property {object} annotations event object metadata. See specific [EVENT_TYPE]{@link PubfoodEvent#EVENT_TYPE} for annotatoins
 * @memberof typeDefs
 */

/**
 * @typedef {SlotConfig} SlotConfig
 * @property {string} name name of the slot/ad unit in [AuctionProvider]{@link pubfood#provider.AuctionProvider} system e.g. DFP /accountId/mpu-rt
 * @property {string} [elementId] DOM target element id
 * @property {array.<number, number>} sizes array of slot sizes
 * @property {number} sizes.0 width slot width
 * @property {number} sizes.1 height slot height
 * @property {string[]} bidProviders array of [BidProvider.name]{@link pubfood#provider.BidProvider#name} values
 * @example
 * var slotConfig = {
 *       name: '/abc/123/rectangle',
 *       elementId: 'div-left',
 *       sizes: [ [300, 250], [300, 600] ],
 *       bidProviders: [
 *                       'p1', 'p2'
 *                     ]
 *     };
 * @memberof typeDefs
 */
var slotConfig = {
  name: '',
  elementId: '',
  sizes: [],
  bidProviders: []
};

/**
 * @typedef {BidderSlots} BidderSlots
 *
 * @property {BidProvider} provider
 * @property {Slot[]} slots
 * @memberof typeDefs
 * @private
 */

/**
 * @typedef {TargetingObject} TargetingObject
 *
 * Key value targeting for a specific slot or the page.
 * @property {string} [type] the targeting level [slot|page]
 * @deprecated Property, <code>TargetingObject.type [slot|page]</code>.<br> Use the existence of "<em><code>TargetingObject.name</code></em>" to detect targeting is slot-level
 * @property {string} [name] the [Slot.name]{@link pubfood#model.Slot#name}
 * @property {string} [id] if targeting object is for a slot, the generated identifier of the slot
 * @property {string} [elementId] the target DOM element id
 * @property {array.<number, number>} [sizes] array of slot sizes
 * @property {object.<string, string>} targeting object containing key/value pair targeting
 * @property {array.<object>} bids source bids for the targeting object
 * @memberof typeDefs
 */

/**
 *
 * @typedef {PubfoodConfig} PubfoodConfig [pubfood]{@link pubfood} constructor configuration
 * @property {number} [auctionProviderCbTimeout] The maximum time the auction provider has before calling [done()]{@link typeDefs.auctionDoneCallback} inside the [AuctionProvider.init]{@link pubfood#provider.AuctionProvider#init} or [AuctionProvider.refresh]{@link pubfood#provider.AuctionProvider#refresh} methods
 * @property {number} [bidProviderCbTimeout] The maximum time the bid provider has before calling [done()]{@link typeDefs.bidDoneCallback} inside the [BidProvider.init]{@link pubfood#provider.BidProvider#init} or [BidProvider.refresh]{@link pubfood#provider.BidProvider#refresh} methods
 * @property {boolean} [randomizeBidRequests] Randomize the order in which [BidProvider]{@link pubfood#provider.BidProvider} requests are made. Default: false.
 * @memberof typeDefs
 * @deprecated the PubfoodConfig configuration object will be replaced in a future major release. [pubfood]{@link pubfood} methods for configuraion properties will be available.
 */
var PubfoodConfig = {
  auctionProviderCbTimeout: 2000,
  bidProviderCbTimeout: 2000,
  randomizeBidRequests: false
};

/**
 * @typedef {AuctionRun} AuctionRun - data pertaining to an init or refresh auction execution
 * @property {boolean} inAuction false if bidding still in process
 * @property {array.<Slot>} slots the slots to be filled for the auction
 * @property {array.<Bid>} bids the bids for the auction run
 * @property {array.<Bid>} lateBids bids that did not get pushed before the timeout to participate in the auction
 * @property {object.<string, boolean>} bidStatus flag to indicate if a bid provider is completed bidding
 * @property {array.<TargetingObject>} targeting the targeting objects used in the auction run 
 * @memberof typeDefs
 * @private
 */

module.exports = {
  BidDelegate: bidDelegate,
  AuctionDelegate: auctionDelegate,
  SlotConfig: slotConfig,
  BidObject: bidObject,
  TransformDelegate: transformDelegate
};
