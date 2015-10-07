'use strict';

var util = require('../util');

/**
 * BidProvider implements bidding partner requests
 *
 * @class
 * @extends pubfood/provider.BaseProvider
 * @memberof pubfood/provider
 */
function BidProvider(bidDelegate) {
  this.slots_ = [];
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
 * Initialize a bid provider.
 *
 * The BidProvider delegate javascript tag and other setup is done here.
 *
 * @param {Object} options - BidProvider delegate specific options
 * @param {Function} callback - a callback to execute in response to the script [onload]{@linkcode https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onload} event
 */
BidProvider.prototype.init = function(options, callback) {
  if (this.bidDelegate &&
      this.bidDelegate.init &&
      util.asType(this.bidDelegate.init) === 'function') {

    var opts = options || {};
    this.bidDelegate.init(opts, callback);

  }
};

/**
 * Refresh bids for ad slots
 */
BidProvider.prototype.refresh = function(callback) {

};

module.exports = BidProvider;
