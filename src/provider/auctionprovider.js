/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

/*eslint no-unused-vars: 0*/

var util = require('../util');
var provider = require('../provider');

/**
 * AuctionProvider implements the  publisher ad server requests.
 *
 * @class
 * @memberof pubfood#provider
 */
function AuctionProvider(auctionDelegate) {
  this.slots_ = [];
  /** @property {object} - reference to the provider delegate */
  this.auctionDelegate = auctionDelegate;
}

/**
 * Create a new [AuctionProvider]{@link pubfood#provider.AuctionProvider} from an object.
 *
 * @param {object} config - provider object literal
 * @returns {pubfood#provider.AuctionProvider} instance of [AuctionProvider]{@link pubfood#provider.AuctionProvider}
 */
AuctionProvider.fromObject = function(config) {


};

/**
 * Set the provider name.
 *
 * @param {String} name - the auction provider name
 * @return {pubfood#provider.AuctionProvider}
 */
AuctionProvider.prototype.name = function(name) {
  this.name = name;
  return this;
};

/**
 * Add a slot.
 *
 * @param {pubfood#model.Slot} slot - a [Slot]{@link pubfood#model.Slot} object
 * @return {pubfood#provider.AuctionProvider}
 */
AuctionProvider.prototype.slot = function(slot) {
  this.slots_.push(slot);
  return this;
};

/**
 * Loads the [auctionDelegate]{@link pubfood#provider.AuctionProvider#auctionDelegate}
 * library.
 *
 * @param {Object} options - AuctionProvider delegate specific options
 * @param {Function} callback - a callback to execute in response to the script [onload]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload} event
 * @return {undefined}
 */
AuctionProvider.prototype.load = function(options, callback) {
  if (!util.hasFunctions(this.bidDelegate, provider.fnNames)) {
    // raise error
    console.log('auctionDelegate function missing');
  }
  this.auctionDelegate.load(options || {}, callback);
};

/**
 * Initialize a auction provider.
 *
 * The AuctionProvider delegate javascript tag and other setup is done here.
 *
 * @param {Object} options - AuctionProvider delegate specific options
 * @param {Function} callback - a callback to execute on init complete
 * @return {undefined}
 */
AuctionProvider.prototype.init = function(options, callback) {
  if (!util.hasFunctions(this.bidDelegate, provider.fnNames)) {
    // raise error
    console.log('auctionDelegate function missing');
  }
  this.auctionDelegate.init(options || {}, callback);
};

/**
 * Refresh for ad slots
 *
 * @param {string[]} slots
 * @param {object} options
 * @param {function} callback
 * @return {undefined}
 */
AuctionProvider.prototype.refresh = function(slots, options, callback) {
  this.auctionDelegate.refresh(slots || {}, options || {}, callback);
};


module.exports = AuctionProvider;
