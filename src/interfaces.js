
'use strict';

/**
 * @module interfaces
 * @namespace pubfood/interfaces
 */

/**
 * Interface for classes that are delegates for the AuctionProvider decorator..
 *
 * @interface AuctionDelegate
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
   * @param {object.<string, *>} bids[].customTageting -
   * @param {object} bids[].adslot -
   * @param {string} bids[].adslot.name -
   * @param {string} bids[].adslot.elementId -
   * @param {array} bids[].adslot.sizes -
   * @param {object.<string, *>} options
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
   * @param {object.<string, *>} options
   * @param {module:pubfood~doneCallback} done
   * @return {undefined}
   */
  refresh: function(bids, options, done) {}
};

/**
 * Interface for classes that are delegates for the BidProvider decorator..
 *
 * @interface BidDelegate
 * @memberof pubfood/interfaces
 */
var bidDelegate = {
  /**
   * Bid provider delegate name.
   *
   * @type {string}
   * @memberof pubfood/interfaces.BidDelegate
   * @instance
   */
  name: '',
  /**
   * Uri location of the delegate JavaScript library/tag.
   *
   * @type {string}
   * @memberof pubfood/interfaces.BidDelegate
   * @instance
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
