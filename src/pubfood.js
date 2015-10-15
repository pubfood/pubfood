/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 *
 * Pubfood - A browser client header bidding JavaScript library.
 */

'use strict';

/*eslint no-unused-vars: 0*/

var version = require('../package.json').version;

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
    provider: require('./provider'),
    util: require('./util'),
    mediator: require('./mediator').mediatorBuilder(),
    interfaces: require('./interfaces'),
    PubfoodError: require('./errors'),
    history: []
  };

  pubfood.library.dumpLog = function(){
    if(console && console.log){
      for (var i = 0; i < this.history.length; i++) {
        console.log(this.history[i]);
      }
    }
  };

  /**
   * logs api calls
   *
   * @param {string} name
   * @param {function} fn
   * @return {function}
   */
  var logCall = function(name, fn) {
    return function () {
      var signature = Array.prototype.slice.call(arguments);
      signature.unshift(name);
      this.library.history.push(signature);
      return fn.apply(api.prototype, arguments);
    };
  };

  /**
   * Creates a new Pubfood Bidding instance
   *
   * @alias pubfood
   * @constructor
   * @param {string} [optional_id] Optional ID
   * @return {pubfood}
   */
  var api = pubfood.library.init = logCall('init', function(optionalId) {
    return this;
  });

  /**
   * Who am I?
   * @function
   * @return {undefined}
   */
  api.prototype.whoAmI = logCall('whoAmI', function() {
    console.log('instanceOf \'pubfood.library.constructor\' v' + this.library.version);
  });

  /**
   * Make this adslot avaialble for bidding
   *
   * @function
   * @param {SlotConfig} slot Slot configuration
   * @return {pubfood}
   */
  api.prototype.addSlot = logCall('addSlot', function(slot) {
    this.library.mediator.addSlot(slot);
    return this;
  });

  /**
   * Get a list a of all registered slots
   * @return {MediatorSlot}
   */
  api.prototype.getSlots = logCall('getSlots', function() {
    return this.library.mediator.slots;
  });

  /**
   * Set the Auction Provider
   *
   * @function
   * @param {AuctionDelegate} delegate Auction provider configuration
   * @throws {PubfoodError}
   * @return {pubfood}
   */
  api.prototype.setAuctionProvider = logCall('setAuctionProvider', function(provider) {
    this.library.mediator.setAuctionProvider(provider);
    return this;
  });

  api.prototype.getAuctionProvider = logCall('getAuctionProvider', function() {
    return this.library.mediator.auctionProvider;
  });

  /**
   * Add a BidProvider
   *
   * @function
   * @param {BidDelegate} delegate Bid provider configuaration
   * @throws {PubfoodError}
   * @return {pubfood}
   * @example {file} ../examples/add-bid-provider.js
  */
  api.prototype.addBidProvider = logCall('addBidProvider', function(delegate) {
    this.library.mediator.addBidProvider(delegate);
    return this;
  });

  /**
   * Gets a list of bidproviders
   * @return {BidProvider[]}
   */
  api.prototype.getBidProviders = logCall('getBidProviders', function() {
    return this.library.mediator.bidProviders;
  });

  /**
   * Add a custom reporter
   * @todo hook this up
   * @param {Reporter} reporter Custom reporter
   * @return {pubfood}
   * @example {file} ../examples/reporter.js
   */
  api.prototype.addReporter = logCall('addReporter', function(reporter){
    return this;
  });

  /**
   * Start the bidding process
   *
   * @return {pubfood}
   */
  api.prototype.start = logCall('start', function() {
    this.library.mediator.start();
    return this;
  });

  /**
   * Refresh slot bids.
   *
   * @param {string[]} [slotNames] Optional list of slot names to refresh.
   * @return {pubfood}
   */
  api.prototype.refresh = logCall('refresh', function(slotNames) {
    this.library.mediator.refresh(slotNames);
    return this;
  });

  api.prototype.library = pubfood.library;

  global.pubfood = pubfood;
  return pubfood;
}));
