/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/

/**
 * Interface for classes that are delegates for the AuctionProvider decorator..
 *
 * @typedef {AuctionDelegate} AuctionDelegate
 * @property {string} name Auction provider delegate name
 * @property {string} libUri
 * @property {function} init Auction provider delegate initial auction request.<br>Called at startup. Returns <i>{undefined}</i>
 * @property {object[]} init.slots - slot objects with bids and page level targeting
 * @property {string} init.slots.name slot name
 * @property {string} init.slots.elementId target DOM elementId
 * @property {array} init.slots.sizes slot sizes
 * @property {object} init.slots.targeting slot targeting key value pairs
 * @property {object} init.options Defaults to {}
 * @property {auctionDoneCallback} init.done Callback to execute on done
 * @property {function} refresh Auction provider delegate refresh auction request.<br>Called at startup. Returns <i>{undefined}</i>
 * @property {object[]} refresh.slots - slot objects with bids and page level targeting
 * @property {string} refresh.slots.name slot name
 * @property {string} refresh.slots.elementId target DOM elementId
 * @property {array} refresh.slots.sizes slot sizes
 * @property {object} refresh.slots.targeting slot targeting key value pairs
 * @property {object} refresh.options Defaults to {}
 * @property {auctionDoneCallback} refresh.done Callback to execute on done
 * @property {function} [trigger] Auction provider delegate function to trigger the auction. Default: [pubfood.timeout]{@link pubfood#timeout}
 * @property {auctionDoneCallback} trigger.done Callback to initialize the auction provider
 */
var auctionDelegate = {
  options: {},
  name: '',
  libUri: '',
  init: function(targeting, options, done) {},
  refresh: function(targeting, options, done) {}
};
auctionDelegate.optional = {
  options: true
};

/**
 * Interface for classes that are delegates for the BidProvider decorator..
 *
 * @typedef {BidDelegate} BidDelegate
 * @property {string} name Bid provider delegate name.
 * @property {string} libUri location of the delegate JavaScript library/tag.
 * @property {function} init Initial bid request for [BidProvider.init]{@link pubfood#provider.BidProvider#init} delegate.
 * <br>Returns {undefined}
 * @property {object} init.slots
 * @property {string} init.slots.name - @todo in process ralionalization of slot object structure
 * @property {array} init.slots.name.sizes
 * @property {object} init.slots.name.bidProviders
 * @property {object} init.options
 * @property {string} init.options.slot Provider external system Slot Name
 * @property {string} init.options.other Other properties optional properties added per provider requirement
 * @property {pushBidCallback} init.pushBid Callback to execute on next bid available
 * @property {bidDoneCallback} init.done Callback to execute on done
 * @property {function} refresh Refresh bids for [BidProvider.refresh]{@link pubfood#provider.BidProvider#refresh} delegate.
 * <br> Return {undefined}
 * @property {object} refresh.slots
 * @property {string} refresh.slots.name - @todo in process ralionalization of slot object structure
 * @property {array} refresh.slots.name.sizes
 * @property {object} refresh.slots.name.bidProviders
 * @property {object} refresh.options
 * @property {string} refresh.options.slot Provider external system Slot Name
 * @property {string} refresh.options.other Other properties optional properties added per provider requirement
 * @property {pushBidCallback} refresh.pushBid Callback to execute on next bid available
 * @property {bidDoneCallback} refresh.done Callback to execute on done
 */
var bidDelegate = {
  options: {},
  name: '',
  libUri: '',
  init: function(slots, options, done) {},
  refresh: function(slots, options, done) {}
};
bidDelegate.optional = {
  options: true
};

/**
 * Function delegates for the [TransformOperator]{@link pubfood#assembler.TransformOperator} decorator.
 * @typedef {function} TransformDelegate
 * @property {Bid[]} bids array of bids to transform @returns {Bid[]}
 * @property {object} params parameters as required by delegate function. Future use.
 * @returns {Bid[]}
 * @example
 *   var transformDelegate = function(bids, params) { console.log('operate on bids'); };
 */
var transformDelegate = function(bids, params) {
};

/**
 * Auction trigger function.
 *
 * A custom function that can be registered with an [AuctionProvider]{@link pubfood#provider.AuctionProvider} that
 * will determine when the publisher ad server request should be initiated.
 *
 * @typedef {function} AuctionTriggerFn
 * @property {startAuctionCallback} start callback to initiate the publisher ad server request
 */
var auctionTriggerFunction = function(startAuctionCallback) {
};

/**
 * Start Publisher Ad Server auction request callback.
 *
 * This is the callback passed into the {@link AuctionTriggerFn}.
 *
 * @typedef {function} startAuctionCallback
 */

/**
 * Callback to notify of {@link pubfood#provider.BidProvider} has its completed bidding process.
 *
 * @typedef {function} bidDoneCallback
 * @fires pubfood.PubfoodEvent.BID_COMPLETE
 */
var bidDoneCallback = function(){

};

/**
 * Publisher ad server request processing is done.
 *
 * @typedef {function} auctionDoneCallback
 * @fires pubfood.PubfoodEvent.AUCTION_COMPLETE
 */
var auctionDoneCallback = function(){

};


/**
 * Callback to push bids into the list for publisher ad server auction.
 * @typedef {function} pushBidCallback
 * @fires pubfood.PubfoodEvent.BID_PUSH_NEXT
 */
var pushBidCallback = function(){

};

/**
 * Custom reporter.
 * @typedef {function} Reporter
 * @param {object} event -
 * @param {string} event.type -
 * @param {*} event.data -
 * @return {undefined}
 */
var Reporter = function(event){

};

/**
 * Bid object structure for the {@link pushBidCallback}.
 *
 * @typedef {BidObject} BidObject
 * @property {string} slot - slot name
 * @property {string} value - publisher adserver targeting bid value
 * @property {array.array.<number, number>} sizes - array of sizes for the slot the bid is for
 * @property {number} sizes.0 width slot width
 * @property {number} sizes.1 height slot height
 * @property {object} [targeting] - key/value pairs for additional adserver targeting
 */
var bidObject = {
  slot: '',
  value: '',
  sizes: [],
  targeting: {}
};
bidObject.optional = {
  targeting: true
};

/**
 * @typedef {SlotConfig} SlotConfig
 * @property {string} name name of the slot/ad unit in [AuctionProvider]{@link pubfood#provider.AuctionProvider} system
 * @property {string} [elementId] DOM target element id
 * @property {array.<number, number>} sizes array of slot sizes
 * @property {number} sizes.0 width slot width
 * @property {number} sizes.1 height slot height
 * @property {object.<string, object>} bidProviders
 * @property {object} bidProviders.providerName bid provider name
 * @property {string} bidProviders.providerName.slot external provider system slot name
 * @example
 * var slotConfig = {
 *       name: '/abc/123/rectangle',
 *       elementId: 'div-left',
 *       sizes: [ [300, 250], [300, 600] ],
 *       bidProviders: {
 *                       p1: {
 *                        slot: 'p1-rectangle-slot'
 *                       }
 *                     }
 *     };
 */
var slotConfig = {
  name: '',
  elementId: '',
  sizes: [],
  bidProviders: {
    providerName: {
      slot: 'slot-name'
    }
  }
};

/**
 *
 * @typedef {PubfoodConfig} PubfoodConfig - all properties are optional
 * @property {string} id
 * @property {number} auctionProviderTimeout The maximum time the acution provider has before calling `done` inside the `init` method
 * @property {number} bidProviderTimeout The maximum time the bid provider has before calling `done` inside the `init` method
 */
var PubfoodConfig = {
  id: '',
  auctionProviderTimeout: 2000,
  bidProviderTimeout: 2000
};

module.exports = {
  BidDelegate: bidDelegate,
  AuctionDelegate: auctionDelegate,
  SlotConfig: slotConfig,
  BidObject: bidObject,
  TransformDelegate: transformDelegate
};
