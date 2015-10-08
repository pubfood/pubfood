/**
 * pubfood
 * Copyright (c) 2015 Yieldbot, Inc. - All rights reserved.
 */

'use strict';

var util = require('../util');

/**
 * BidProvider implements bidding partner requests
 *
 * @class
 * @memberof pubfood/provider
 */
function BidProvider(bidDelegate) {
  this.slots_ = [];
  /** @property {object} - reference to the provider delegate */
  this.bidDelegate = bidDelegate;
}

/**
 * Set the provider name.
 *
 * @param {String} name - the bidder provider name
 * @returns {Function} this
 */
BidProvider.prototype.name = function(name) {
  this.name = name;
  return this;
};

/**
 * Add a slot to bid on.
 *
 * @param {Object} slot - a [Slot]{@link pubfood/model.Slot} object
 */
BidProvider.prototype.slot = function(slot) {
  this.slots_.push(slot);
  return this;
};

/**
 * Loads the [bidDelegate]{@link pubfood/provider.BidProvider#bidDelegate}
 * library.
 *
 * @param {Object} options - BidProvider delegate specific options
 * @param {Function} callback - a callback to execute in response to the script [onload]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload} event
 */
BidProvider.prototype.load = function(options, callback) {
  this.bidDelegate.load(options || {}, callback);
};

/**
 * Initialize a bid provider.
 *
 * The BidProvider delegate javascript tag and other setup is done here.
 *
 * @param {Object} options - BidProvider delegate specific options
 * @param {Function} callback - a callback to execute on init complete
 */
BidProvider.prototype.init = function(options, callback) {
  if (this.bidDelegate &&
      this.bidDelegate.init &&
      util.asType(this.bidDelegate.init) === 'function') {

    this.bidDelegate.init(options || {}, callback);

  }
};

/**
 * Refresh bids for ad slots
 */
BidProvider.prototype.refresh = function(slots, options, callback) {
  this.bidDelegate.refresh(slots || {}, options || {}, callback);
};

module.exports = BidProvider;
