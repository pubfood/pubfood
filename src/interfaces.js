/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/**
 * Interface for classes that are delegates for the AuctionProvider decorator..
 *
 * @typedef {object} AuctionDelegate
 * @memberof pubfood/interfaces
 */
var auctionDelegate = {
  /**
   * Auction provider delegate name.
   *
   * @type {string}
   * @memberof pubfood/interfaces.AuctionDelegate
   * @instance
   */
  name: '',
  /**
   * Auction provider delegate initial auction request.
   *
   * @instance
   * @memberof pubfood/interfaces.AuctionDelegate
   *
   * @function init
   * @param {object[]} bids
   * @param {string} bids[].name -
   * @param {string|number} bids[].price -
   * @param {object} bids[].customTageting -
   * @param {object} bids[].adslot -
   * @param {string} bids[].adslot.name -
   * @param {string} bids[].adslot.elementId -
   * @param {array} bids[].adslot.sizes -
   * @param {object} options
   * @param {module:pubfood~doneCallback} done
   * @return {undefined}
   */
  init: function(bids, options, done) {},
  /**
   * Auction provider delegate refresh auction request.
   *
   * @instance
   * @memberof pubfood/interfaces.AuctionDelegate
   *
   * @function refresh
   * @param {object[]} slots
   * @param {string} slots[].name -
   * @param {object} options
   * @param {module:pubfood~doneCallback} done
   * @return {undefined}
   */
  refresh: function(bids, options, done) {}
};

/**
 * Interface for classes that are delegates for the BidProvider decorator..
 *
 * @typedef {object} BidDelegate
 */
var bidDelegate = {
  /**
   * Bid provider delegate name.
   *
   * @type {string}
   * @lends BidDelegate
   */
  name: '',
  /**
   * Uri location of the delegate JavaScript library/tag.
   *
   * @type {string}
   * @memberof pubfood/interfaces.BidDelegate
   */
  libUri: '',
  /**
   * Initial bid request for [BidProvider.init]{@link pubfood/provider.BidProvider#init} delegate.
   *
   * @function
   * @instance
   * @memberof pubfood/interfaces.BidDelegate
   * @param {object[]} slots
   * @param {object} slots[].adslot Adslot configuration
   * @param {string} slots[].adslot.name Name
   * @param {string} slots[].adslot.elementId Target element on page
   * @param {array} slots[].adslot.sizes Adslot sizes
   * @param {object} options
   * @param {string} [options.externalSlot] Provider external system Slot Name
   * @param {string} options.others... Other properties optional properties added per provider requirement
   * @param {module:pubfood~doneCallback} done Callback to execute on done
   * @return {undefined}
   */
  init: function(slots, options, done) {},
  /**
   * Refresh bids for [BidProvider.init]{@link pubfood/provider.BidProvider#init} delegate.
   *
   * @function
   * @instance
   * @memberof pubfood/interfaces.BidDelegate
   * @param {object[]} slots
   * @param {object} slots[].adslot Adslot configuration
   * @param {string} slots[].adslot.name Name
   * @param {string} slots[].adslot.elementId Target element on page
   * @param {array} slots[].adslot.sizes Adslot sizes
   * @param {object} options
   * @param {string} [options.externalSlot] Provider external system Slot Name
   * @param {string} options.others... Other properties optional properties added per provider requirement
   * @param {module:pubfood~doneCallback} done Callback to execute on done
   * @return {undefined}
   */
  refresh: function(slots, options, done) {}
};


/**
 * request operator callback
 *
 * @function requestOperatorCallback
 * @param {*} data
 * @return {boolean}
 * @memberof pubfood/interfaces
 * @example

  function(data){
    return false;
  }
 */

/**
 * transform operator callback
 *
 * @function transformOperatorCallback
 * @param {*} data
 * @return {boolean}
 * @memberof pubfood/interfaces
 */

/**
 * done callback
 *
 * @function doneCallback
 * @return {undefined}
 * @memberof pubfood/interfaces
 */

/**
 * @typedef {object} MediatorSlot
 * @property {string} name -
 */

/**
 * @typedef {object} MediatorBidProvider
 * @property {string} name -
 */

/**
 * @typedef {object} BidProviderConfig
 * @property {string} name The provider's name
 * @property {string|number} price The bid price
 * @property {object} customTageting Custom targeting parameters to be passed to the AuctionProvider
 * @property {object} adslot Adslot configuration
 * @property {string} adslot.name Name
 * @property {string} adslot.elementId Target element on page
 * @property {array} adslot.sizes Adslot sizes
 */

/**
 * bid provider init
 * @function bidProviderInit
 * @param {object[]} bids
 * @param {string} bids[].name The provider's name
 * @param {string|number} bids[].price The bid price
 * @param {object} bids[].customTageting Custom targeting parameters to be passed to the AuctionProvider
 * @param {object} bids[].adslot Adslot configuration
 * @param {string} bids[].adslot.name Name
 * @param {string} bids[].adslot.elementId Target element on page
 * @param {array} bids[].adslot.sizes Adslot sizes
 * @param {object} options TBD
 * @param {doneCallback} done Callback to execute on done
 * @return {undefined}
 */

/**
 * bid provider refresh
 * @function bidProviderRefresh
 * @param {object[]} slots
 * @param {string} slots[].name -
 * @param {object} options
 * @param {doneCallback} done
 * @return {undefined}
 */

/**
 * @typedef {object} BidConfig
 * @property {string} name - slot name
 * @property {string} elementId -
 * @property {array.<number, number>} sizes
 * @property {number} sizes.0 - width
 * @property {number} sizes.1 - height
 * @property {object[]} bidProviders
 * @property {string} bidProviders.provider -
 * @property {string} bidProviders.slot -
 */

/**
 * @typedef Model
 */

/**
 * @typedef {object} SlotConfig
 * @property {string} name name of the slot/ad unit in [AuctionProvider]{@link pubfood/provider.AuctionProvider} system
 * @property {string} [elementId] DOM target element id
 * @property {dimensions} sizes array of slot size dimensions
 * @property {object[]} bidProviders
 * @property {string} bidProviders.provider bid provider name
 * @property {string} [bidProviders.slot] external provider system slot name
 */

var slotConfig = {
  name: '',
  sizes: [],
  elementId: '',
  bidProviders: [
    {
      name: '',
      slot: ''
    }
  ]
};

var bidObject = {

};

module.exports = {
  BidDelegate: bidDelegate,
  AuctionDelegate: auctionDelegate,
  SlotConfig: slotConfig,
  BidObject: bidObject
};
