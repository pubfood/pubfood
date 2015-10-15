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
 * @property {BidProviderConfig[]} init.bids A list of bid providers
 * @property {object} init.options Defaults to {}
 * @property {doneCallback} init.done Callback to execute on done
 * @property {function} refresh Auction provider delegate refresh auction request.<br>Called at startup. Returns <i>{undefined}</i>
 * @property {string[]} refresh.slots A list of slots to be refreshed
 * @property {object} refresh.options Defaults to {}
 * @property {doneCallback} refresh.done Callback to execute on done
 */
var auctionDelegate = {
  name: '',
  libUri: '',
  init: function(bids, options, done) {},
  refresh: function(bids, options, done) {}
};

/**
 * Interface for classes that are delegates for the BidProvider decorator..
 *
 * @typedef {BidDelegate} BidDelegate
 * @property {string} name Bid provider delegate name.
 * @property {string} libUri location of the delegate JavaScript library/tag.
 * @property {function} init Initial bid request for [BidProvider.init]{@link pubfood/provider.BidProvider#init} delegate.
 * <br>Returns {undefined}
 * @property {SlotConfig[]} init.slots Adslot configuration
 * @property {object} init.options
 * @property {string} init.options.externalSlot Provider external system Slot Name
 * @property {string} init.options.other Other properties optional properties added per provider requirement
 * @property {doneCallback} init.done Callback to execute on done
 * @property {function} refresh Refresh bids for [BidProvider.init]{@link pubfood/provider.BidProvider#init} delegate.
 * <br> Return {undefined}
 * @property {SlotConfig[]} refresh.slots Adslot configuration
 * @property {object} refresh.options
 * @property {string} refresh.options.externalSlot Provider external system Slot Name
 * @property {string} refresh.options.other Other properties optional properties added per provider requirement
 * @property {doneCallback} refresh.done Callback to execute on done
 */
var bidDelegate = {
  name: '',
  libUri: '',
  init: function(slots, options, done) {},
  refresh: function(slots, options, done) {}
};

/**
 * request operator callback
 *
 * @function requestOperatorCallback
 * @param {*} data TBD
 * @return {boolean}
 * @example {file} ../examples/request-operator.js
 */
var requestOperatorCallback = function(data){
  return true;
};

/**
 * transform operator callback
 *
 * @function transformOperatorCallback
 * @param {*} data TBD
 * @return {boolean}
 * @example {file} ../examples/transport-operator.js
 */
var transformOperatorCallback = function(data){
  return true;
};

/**
 * done callback
 *
 * @function doneCallback
 * @return {undefined}
 */
var doneCallback = function(){

};

/**
 * @typedef {object} BidProviderConfig
 * @property {string} name The provider's name
 * @property {string|number} price The bid price
 * @property {object} customTageting Custom targeting parameters to be passed to the AuctionProvider
 * @property {SlotConfig} adslot Adslot configuration
 */
var BidProviderConfig = {
  name: '',
  price: '',
  customTageting: {},
  adslot: {}
};

/**
 * bid provider init
 * @function bidProviderInit
 * @param {BidProviderConfig[]} bids A list of bid providers
 * @param {object} options Defaults to {}
 * @param {doneCallback} done Callback to execute on done
 * @return {undefined}
 */
var bidProviderInit = function(bids, options, done){

};

/**
 * bid provider refresh
 * @function bidProviderRefresh
 * @param {string[]} slots The slots to be refreshed
 * @param {object} options Defaults to {}
 * @param {doneCallback} done Callback to execute on done
 * @return {undefined}
 */
var bidProviderRefresh = function(slots, options, done){

};

/**
 * Custom reporter
 *
 * @function Reporter
 * @params {PubfoodEvent} event
 * @return {undefined}
 */
var Reporter = function(event){

};

/**
 * Bid object structure for the [nextBid]{@link pubfood/interfaces.nextBid} callback.
 *
 * @typedef {object} BidObject
 * @property {string} [provider] - bid provider name
 * @property {string} slot - slot name
 * @property {string} label - publisher adserver targeting label/key for the bid value
 * @property {string} value - publisher adserver targeting bid value
 * @property {array[]} sizes - array of sizes for the slot the bid is for
 * @property {object} customTargeting - key/value pairs for additional adserver targeting
 */
var bidObject = {
  slot: '',
  value: '',
  sizes: []
};

/**
 * @typedef {SlotConfig} SlotConfig
 * @property {string} name name of the slot/ad unit in [AuctionProvider]{@link pubfood/provider.AuctionProvider} system
 * @property {string} [elementId] DOM target element id
 * @property {array.<number, number>} sizes array of slot sizes
 * @property {number} sizes.0 width slot width
 * @property {number} sizes.1 height slot height
 * @property {object.<string, object>} bidProviders
 * @property {object} bidProviders.providerName bid provider name
 * @property {string} bidProviders.providerName.slot external provider system slot name
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

module.exports = {
  BidDelegate: bidDelegate,
  AuctionDelegate: auctionDelegate,
  SlotConfig: slotConfig,
  BidObject: bidObject
};
