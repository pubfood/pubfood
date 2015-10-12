/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/

var version = require('../package.json').version;

/**
 * Pubfood.
 *
 * A browser client header bidding JavaScript library.
 * @module pubfood
 */
(function(global, undefined, ctor) {

  if (global) {
    module.exports = ctor(global, global.pfConfig || {});
  }

}(window || {}, undefined, function(global, config) {

  var pubfood = function(optionalId) {
    return new pubfood.library.init(optionalId);
  };

  pubfood.library = pubfood.prototype = {
    version: version,
    model: require('./model'),
    util: require('./util'),
    mediator: require('./mediator').mediatorBuilder(),
    interfaces: require('./interfaces'),
    PubfoodError: require('./errors')
  };

  pubfood.log = function(msg) {
    console.log(msg);
  };

  /**
   * Creates a new Pubfood Bidding instance
   *
   * @alias pubfood
   * @constructor
   * @param {string} [optional_id] Optional ID
   * @return {pubfood}
   */
  var api = pubfood.library.init = function(optionalId) {
    return this;
  };

  api.prototype.whoAmI = function() {
    console.log('instanceOf \'pubfood.library.constructor\' v' + this.library.version);
  };

  /**
   * Make this adslot avaialble for bidding
   *
   * @function
   * @param {object} slot
   * @param {string} slot.name - slot name
   * @param {string} slot.elementId -
   * @param {array[]} slot.sizes -
   * @param {number} slot.sizes[].0 - width
   * @param {number} slot.sizes[].1 - height
   * @param {object[]} slot.bidProviders -
   * @param {string} slot.bidProviders[].provider -
   * @param {string} slot.bidProviders[].slot -
   * @return {pubfood}
   */
  api.prototype.addSlot = function(slot) {
    this.library.mediator.addSlot(slot);
  };
  api.prototype.getSlots = function() {
    return this.library.mediator.slots;
  };
  /**
   * Set the Auction Provider
   *
   * @function
   * @param {object} config
   * @param {string} config.name
   * @param {string} config.libUrl
   * @param {object} [config.options]
   * @param {module:pubfood~auctionProviderInit} config.init
   * @param {module:pubfood~auctionProviderRefresh} config.refresh
   * @return {pubfood}
   */
  api.prototype.setAuctionProvider = function(provider) {

  };

  /**
   * Add a BidProvider
   *
   * @function
   * @param {object} provider
   * @param {string} provider.name The name of the BidProvider
   * @param {string} provider.libUrl The URL of the BidProvider's library code
   * @param {object} [provider.options] Optional configuration
   * @param {module:pubfood~bidProviderInit} provider.init -
   * @param {module:pubfood~bidProviderRefresh} provider.refresh -
   * @return {pubfood}
   * @throws {PubfoodError}
   * @example
   pubfood.addBidProvider({
   name: 'Yieldbot',
   options: {},
   libUrl: '',
   init: function(options, done) {
   },
   refresh: function(slots, options, done) {
   }
   });
  */
  api.prototype.addBidProvider = function(provider) {
    this.library.mediator.addBidProvider(provider);
  };
  api.prototype.getBidProviders = function() {
    return this.library.mediator.bidProviders;
  };

  /**
   * Start the bidding process
   *
   * @return {pubfood}
   */
  api.prototype.start = function() {
    this.library.mediator.start();
  };

  /**
   * Refresh slot bids.
   *
   * @param {array} [slots] - optional list of slot names to refresh.
   * @return {pubfood}
   */
  api.prototype.refresh = function(slotNames) {
    this.library.mediator.refresh(slotNames);
  };

  api.prototype.library = pubfood.library;

  global.pubfood = pubfood;
  return pubfood;
}));
