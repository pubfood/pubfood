/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');

/**
 * AuctionProvider implements the  publisher ad server requests.
 *
 * @class
 * @memberof pubfood/provider
 */
function AuctionProvider(auctionDelegate) {
  this.slots_ = [];
  /** @property {object} - reference to the provider delegate */
  this.auctionDelegate = auctionDelegate;
}

/**
 * Set the provider name.
 *
 * @param {String} name - the auction provider name
 * @returns {Function} this
 */
AuctionProvider.prototype.name = function(name) {
  this.name = name;
  return this;
};

/**
 * Add a slot.
 *
 * @param {Object} slot - a [Slot]{@link pubfood/model.Slot} object
 */
AuctionProvider.prototype.slot = function(slot) {
  this.slots_.push(slot);
  return this;
};

/**
 * Loads the [auctionDelegate]{@link pubfood/provider.AuctionProvider#auctionDelegate}
 * library.
 *
 * @param {Object} options - AuctionProvider delegate specific options
 * @param {Function} callback - a callback to execute in response to the script [onload]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload} event
 */
AuctionProvider.prototype.load = function(options, callback) {
  this.auctionDelegate.load(options || {}, callback);
};

/**
 * Initialize a auction provider.
 *
 * The AuctionProvider delegate javascript tag and other setup is done here.
 *
 * @param {Object} options - AuctionProvider delegate specific options
 * @param {Function} callback - a callback to execute on init complete
 */
AuctionProvider.prototype.init = function(options, callback) {
  if (this.auctionDelegate &&
      this.auctionDelegate.init &&
      util.asType(this.auctionDelegate.init) === 'function') {

    this.auctionDelegate.init(options || {}, callback);

  }
};

/**
 * Refresh for ad slots
 */
AuctionProvider.prototype.refresh = function(slots, options, callback) {
  this.auctionDelegate.refresh(slots || {}, options || {}, callback);
};


module.exports = AuctionProvider;
